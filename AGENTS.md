<!-- BEGIN:nextjs-agent-rules -->
# Agent Notes for Photocards App

This project is a Next.js app with filesystem-backed flashcard sets.

## Core rules

- Treat `sets/` as generated data and do not commit it.
- Keep card persistence aligned across the storage helper, API route, and UI.
- Prefer small, targeted edits over broad refactors.
- Rebuild after changes that affect routing, rendering, or storage.

## Storage model

- Sets live under `sets/<set-id>/`.
- Card photos live in `sets/<set-id>/photos/`.
- Card text files live in `sets/<set-id>/texts/`.
- Metadata lives in `metadata.json` inside the set folder.

## Workflow notes

- Use the existing study, gallery, and batch-import components as the main UX entry points.
- When adding or editing cards, update both the filesystem data and the returned `Flashcard` object.
- Keep theme-related UI text and SSR output stable to avoid hydration mismatches.
<!-- END:nextjs-agent-rules -->
