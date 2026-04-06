const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("photocardsDesktop", {
  platform: process.platform,
});
