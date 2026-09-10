# Alexander Chen — Portfolio

A React and Vite portfolio deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Edit portfolio content

Edit `src/data.js` for the profile, contact links, biography, and projects. Project cards support three cover options:

- `image`: a photo or designed cover image
- `video`: a muted, looping MP4 preview, optionally with `poster`
- `visual`: the built-in fallback cover used while final media is being prepared

### Add a project photo

1. Export a WebP or JPEG around 1,600–2,400 pixels wide.
2. Keep the file below roughly 1 MB when possible.
3. Put it in `public/projects/`, for example `public/projects/tt-cover.webp`.
4. Add this field to the matching project in `src/data.js`:

```js
image: "/projects/tt-cover.webp",
```

### Add a video preview

1. Export an H.264 MP4 without essential audio; card previews are muted.
2. Use a short loop and keep it as small as practical. Host long or high-resolution films externally rather than committing very large files to Git.
3. Export a WebP poster frame so the card still looks good while loading.
4. Put both files in `public/projects/` and add:

```js
video: "/projects/project-preview.mp4",
poster: "/projects/project-poster.webp",
```

### Add a playground project

The collage is controlled by `playgroundItems` in `src/data.js`. Each item has a numbered layout `slot`. Keep the slot when replacing a mock object so it stays in the same position.

```js
{
  id: "project-name",
  slot: "one",
  label: "Project title",
  href: "https://example.com/full-project",
  image: "/projects/project-cover.webp",
}
```

For a looping preview, replace `image` with `video` and `poster`. If an item has no image or video, its `kind` selects one of the CSS mock objects: `photo`, `motion`, `poster`, `type`, `sketchbook`, or `blobs`.

### Upload your own Playground stickers

Put transparent PNG or WebP cutouts in `public/projects/playground/stickers/`. For crisp results on a 1920×1080 display, export each sticker at roughly 1,000–1,600 pixels on its longest side. Transparent WebP is preferred when it produces a smaller file.

Replace one of the mock items in `playgroundItems` with:

```js
{
  id: "camera",
  slot: "one",
  label: "Photography",
  image: "/projects/playground/stickers/camera.webp",
  alt: "Camera from my photography practice",
  scale: 1,
  rotation: "-4deg",
  position: "center",
  href: "https://example.com/photography",
}
```

The optional `scale`, `rotation`, and `position` fields let each cutout be tuned without editing the layout CSS. Photos with a rectangular background work too, but transparent cutouts will match the floating-object style most closely.

The résumé lives at `public/resume.pdf`. Replace that file with the same filename whenever it is updated.
