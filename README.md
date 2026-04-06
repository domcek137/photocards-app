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

## Storage layout

Generated set data lives under the repository root in `sets/`.

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
- Re-run `npm run build` after edits that touch rendering, routing, or storage.
