# Editorial portfolio template

## Run it

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Customize it

1. Edit `src/data.js` for your name, bio, links, projects, and about copy.
2. Replace or extend the artwork in `ProjectVisual` inside `src/App.jsx`. You can also swap the component for ordinary `<img>` or `<video>` elements.
3. Change the colour and spacing tokens at the top of `src/styles.css`.
4. Put your resume in `public/resume.pdf`, or change the resume URL in `src/data.js`.

The `/about` view uses client-side history. If you deploy to a static host, configure its SPA fallback so `/about` serves `index.html`.
