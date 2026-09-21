# ayush deshmukh — personal & research site

Plain HTML/CSS/JS, no build step. Style: "Paper & Ink × Brutalist" — every
component mixes hand-drawn touches (rotation, handwritten labels, a
polaroid photo) with brutalist ones (thick borders, hard offset shadows)
at once. The About page has a small robot companion that walks a wavy
track down the right margin and cheers when a new section arrives.

## Run it locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Structure

```
index.html                     About: photo, bio, notes, publications preview, projects preview, robot companion
publications.html              Full publication list with BibTeX (click "BibTeX" to expand, "Copy" to copy)
cv.html                        Education / experience timeline + CV download button
projects/
  index.html                   Grid of project cards
  example-project/index.html   Template project page — copy this folder for a new project
blog/
  index.html                   Post list
  first-post.html              Template post — copy this file for a new post
assets/
  css/style.css                Shared stylesheet (all pages)
  js/main.js                   Mobile nav toggle + BibTeX show/copy (all pages)
  js/companion.js              Robot companion logic (index.html only)
  img/                         Photos, project figures
  papers/                      Paper PDFs
  cv.pdf                       ← add your CV PDF here (referenced by cv.html)
style-gallery/                 Design exploration — not linked from the site, safe to delete
```

## Adding a new project page

1. Copy `projects/example-project/` to `projects/your-project-name/`.
2. Edit `projects/your-project-name/index.html` — title, authors, links, abstract, BibTeX.
3. Add an `<a class="card">` for it in `projects/index.html` (copy the existing one, update the `href`, `h3`, `p`, `span.tag`).
4. Optional: add it to the "Projects" preview on `index.html` too.

## Adding a new blog post

1. Copy `blog/first-post.html` to `blog/your-post-slug.html`.
2. Edit the title, date, and body.
3. Add a `<a class="post-row">` row for it in `blog/index.html`.

## Adding a publication

Add a new `<article class="pub">` block in `publications.html` (copy an
existing one) and, if you want it featured on the homepage, in the
Publications section of `index.html` too. Each has a `.bibtex-box` you can
fill in — the "BibTeX" button toggles it and "Copy" copies it to the clipboard.

## Photo & CV

- Drop a photo at `assets/img/` and set it as the `<img>` inside
  `.photo` on `index.html` (currently shows initials "AD" as a placeholder).
- Drop your CV PDF at `assets/cv.pdf` — the download button on `cv.html`
  already points there.

## Nav

There's no templating, so the header/nav is duplicated on every page with
relative paths adjusted for its folder depth. If you add/rename/reorder a
nav link, update it in every HTML file (`grep -rl 'nav.links'` to find them).

## Deploying

Works as-is on **GitHub Pages** (push to a repo, enable Pages on the
`main` branch) or **Netlify/Vercel** (drag-and-drop or connect the repo,
no build command needed — the site is already static).

## Design system quick reference

- Colors, fonts, and every reusable component (`.hero`, `.pub`, `.card`,
  `.timeline`, `.post-row`, buttons, nav) live in `assets/css/style.css`.
- Handwritten accents use `Caveat`; structured/boxed labels use
  `Space Grotesk`; body text is `Source Serif 4`; headline names use
  `Instrument Serif`.
- `--accent-warm` (rust orange) is the hand-drawn accent; `--accent-hi`
  (mustard) is the brutalist highlight/hover color.
