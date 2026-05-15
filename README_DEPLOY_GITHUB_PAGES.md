# TRUST GitHub Pages frontend — fixed deploy package

This folder is the exact content that must be placed in the root of your GitHub Pages repository.

Correct structure:

```
/index.html
/app.html
/leaderboard.html
/landing.js
/app.js
/styles.css
/assets/...
/downloads/...
```

Important:
- Do NOT upload `app.js` as `index.html`.
- Do NOT upload the whole backend folder to GitHub Pages.
- Do NOT make GitHub Pages point to `backend/` or `sourcemod/`.
- GitHub Pages must serve `index.html` as HTML, not JavaScript text.

If your site opens as raw JavaScript text, replace the repository contents with this folder's contents and commit again.
