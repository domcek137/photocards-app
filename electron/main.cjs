const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

let mainWindow = null;
let nextServerProcess = null;

const isDev = !app.isPackaged;
const devUrl = process.env.ELECTRON_START_URL || "http://127.0.0.1:3000";

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const findFreePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on("error", (error) => reject(error));
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not determine free port.")));
        return;
      }

      server.close(() => resolve(address.port));
    });
  });

const isUrlReady = (url) =>
  new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode !== undefined && response.statusCode < 500);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(1000, () => {
      request.destroy();
      resolve(false);
    });
  });

const waitForUrl = async (url, timeoutMs = 30000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const ready = await isUrlReady(url);
    if (ready) {
      return;
    }

    await wait(300);
  }

  throw new Error(`Timed out waiting for server at ${url}`);
};

const resolveStandaloneServerPath = (resourcesRoot) => {
  const standaloneRoot = app.isPackaged
    ? path.join(resourcesRoot, "next", "standalone")
    : path.join(resourcesRoot, ".next", "standalone");

  const directServer = path.join(standaloneRoot, "server.js");
  if (fs.existsSync(directServer)) {
    return directServer;
  }

  if (!fs.existsSync(standaloneRoot)) {
    throw new Error(`Standalone directory not found: ${standaloneRoot}`);
  }

  const nestedServer = fs
    .readdirSync(standaloneRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(standaloneRoot, entry.name, "server.js"))
    .find((candidate) => fs.existsSync(candidate));

  if (nestedServer) {
    return nestedServer;
  }

  throw new Error(`Could not locate standalone server.js in: ${standaloneRoot}`);
};

const startBundledNextServer = async () => {
  const port = await findFreePort();
  const resourcesRoot = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const standalonePath = resolveStandaloneServerPath(resourcesRoot);

  process.env.PHOTOCARDS_DATA_PATH = app.getPath("userData");

  const nodeRunner = app.isPackaged ? process.execPath : "node";

  nextServerProcess = spawn(nodeRunner, [standalonePath], {
    cwd: path.dirname(standalonePath),
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: app.isPackaged ? "1" : process.env.ELECTRON_RUN_AS_NODE,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      PHOTOCARDS_DATA_PATH: app.getPath("userData"),
    },
    windowsHide: true,
  });

  nextServerProcess.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    if (text.trim()) {
      console.log(`[next] ${text.trim()}`);
    }
  });

  nextServerProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    if (text.trim()) {
      console.error(`[next:error] ${text.trim()}`);
    }
  });

  nextServerProcess.on("error", (error) => {
    console.error("Next server process failed:", error);
  });

  nextServerProcess.once("exit", (code, signal) => {
    if (code !== 0) {
      console.error(`Next server exited before readiness. code=${code ?? "null"}, signal=${signal ?? "null"}`);
    }
  });

  const appUrl = `http://127.0.0.1:${port}`;
  await waitForUrl(appUrl, 45000);
  return appUrl;
};

const stopBundledNextServer = () => {
  if (!nextServerProcess || nextServerProcess.killed) {
    return;
  }

  nextServerProcess.kill("SIGTERM");
  nextServerProcess = null;
};

const createMainWindow = async () => {
  let urlToLoad = devUrl;

  if (!isDev) {
    urlToLoad = await startBundledNextServer();
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  await mainWindow.loadURL(urlToLoad);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(async () => {
  try {
    await createMainWindow();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup failure";
    await dialog.showErrorBox("Photocards failed to start", message);
    app.quit();
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("before-quit", () => {
  stopBundledNextServer();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
