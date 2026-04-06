# Photocards App

Photocards App is a Next.js study tool for image-and-text flashcards. Sets are stored on disk and can be created, browsed, batch imported, edited, and studied in a browser.

## What it does

- Create flashcard sets with a name, description, and tags.
- Add cards one at a time or import them in batch.
- Store card photos and text in a filesystem-backed `sets/` directory.
- Study cards with flip, shuffle, reset, and progress tracking.
- Switch between light and dark themes.

## Local development

Run the app with:

```bash
cd photocards-app
npm.cmd run dev
```

Build for production with:

```bash
npm.cmd run build
```

If PowerShell blocks npm scripts on Windows, use:

```powershell
cmd /c npm run dev
```

## Desktop packaging with Electron

This project is configured to build a desktop app with Electron. The desktop entry point is `electron/main.cjs`, and the app runs the Next.js server in packaged mode using the standalone build output.

### Prerequisites

- Install Node.js on the machine that will build the app.
- Use the repository root at `photocards-app`.
- Make sure `npm install` has already been run so the Electron dependencies are available.

### Build commands

Create an unpacked desktop build for Windows or macOS with:

```bash
npm run build:desktop
```

Create a macOS `.dmg` package with:

```bash
npm run build:desktop:mac
```

If you want to inspect the generated app folder without an installer, use:

```bash
npm run build:desktop:dir
```

### Where the files are created

Desktop build output is written to `dist-desktop/`.

On Windows, the unpacked app executable is here:

```text
dist-desktop/win-unpacked/Photocards.exe
```

That `.exe` is the runnable app inside the unpacked folder. It is not a single-file installer. If you want a Windows installer `.exe`, the Electron Builder target must be changed from `dir` to an installer target such as `nsis`.

On macOS, the distributable is written as a `.dmg` inside `dist-desktop/`.

### Recommended release flow

1. Run `npm run build` to verify the web app still compiles.
2. Run `npm run build:desktop` to verify Electron packaging works.
3. On Windows, open `dist-desktop/win-unpacked/Photocards.exe` to test the desktop app.
4. On macOS, build the `.dmg` and install it like a normal app.
5. Share the resulting desktop artifact with users instead of the source code.

## Storage layout

Generated set data lives under the repository root in `sets/`.

When you run the packaged Electron app, data is stored in your user profile instead of the repo. On Windows, the packaged app writes to:

```text
%APPDATA%/photocards-app/sets/
```

That is the folder to check for sets created from the `.exe`.

On first launch, the packaged app copies any bundled starter sets from the install bundle into that writable folder. The files under `dist-desktop/win-unpacked/resources/next/standalone/photocards-app/sets/` are part of the packaged app payload, not the live save location.

Each set uses this structure:

```text
sets/
	<set-id>/
		metadata.json
		photos/
		texts/
```

The `sets/` directory is ignored by Git because it is runtime data.

## Notes for contributors

- Keep set IDs lowercase and filesystem-safe.
- Preserve the current filesystem-backed storage model unless there is a strong reason to change it.
- Update the relevant API route and storage helper together when changing card persistence.
- When you update project guidance, update this README and [AGENTS.md](AGENTS.md) together so both human and agent instructions stay in sync.
- Re-run `npm run build` after edits that touch rendering, routing, or storage.
- Keep desktop build outputs out of Git; `dist-desktop/` is already ignored.
