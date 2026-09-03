# heby's21.exe

A static, single-page birthday website. No backend or build step is required.

## Preview

Open `index.html` directly, or run a local static server in this folder:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

The birthday update triggers when an open page crosses midnight in UTC+8. It does not appear early when the normal page is opened. To force a preview, double-click `birthday-preview.html` or visit `http://localhost:8000/?birthday=1`.

## Content

- Photos and video live in `assets/`.
- Filenames and module content are configured near the top of `app.js`.
- The temporary final letter is in the `#letter` section of `index.html`.
- All colors are CSS variables at the top of `styles.css`.

The final letter unlocks after `US`, `FIRSTS`, `MY VIEW`, `messages.exe`, and `RECYCLE BIN` have each been opened once.
