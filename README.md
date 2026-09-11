# jolyon.co.uk

Static site built with [Jekyll](https://jekyllrb.com/). Same idea as the
[ASAB 2025 site](https://github.com/asabwinter/2025): add content by dropping files into
folders, then sync/push.

## Adding a post

1. Add an image (or a folder of images) under `assets/images/posts/<your-post-slug>/`.
2. Create `_posts/YYYY-MM-DD-your-post-slug.md` (or `.html` if you want to write raw HTML —
   same front matter, content is used as-is). The date prefix controls sort order/URL date and
   can be today's date or the date the work happened.
3. Fill in the front matter:

   ```yaml
   ---
   title: "Your post title"
   image: /assets/images/posts/your-post-slug/main.jpg
   excerpt: "One sentence shown in the homepage carousel and on theme pages."
   themes: [visual-ecology, light-pollution]
   ---
   ```

   - `image` — the main/listing photo for this post.
   - `excerpt` — the short description shown next to it in listings.
   - `themes` — slugs matching the pages that should list this post. Current slugs:
     `visual-ecology`, `visual-modelling`, `light-pollution`, `behaveai`, `micatoolbox`,
     `light-measurement-tools`, `experimental-tools`, `animal-vision`, `outreach-media`.
     A post can have several.
4. Write the body in Markdown. Raw HTML (e.g. a YouTube `<iframe>` embed) can be pasted directly
   into the Markdown file wherever you want it.

See `_posts/2026-09-01-example-visual-ecology-post.md` and
`_posts/2026-09-05-example-video-embed-post.md` for worked examples — delete the three example
posts (and their image folders) once you're happy with the format.

## Editing the fixed pages

The research/project/Animal Vision/Outreach pages live in `_pages/`, one file each, with a
`slug:` that matching posts' `themes:` reference. Edit the placeholder text (marked
`> TODO:`) directly. `_data/publications.yml` and `_data/funding.yml` drive the Publications and
Funding pages — edit those data files rather than the page templates.

The menu itself is `_data/navigation.yml`.

## Preview locally

Requires Ruby. Then:

```sh
bundle install
bundle exec jekyll serve
```

Visit http://localhost:4000. `bundle exec jekyll build` (no `serve`) just builds `_site/`
without watching, and is a good way to catch errors before pushing.

## Deploying

**GitHub Pages (default):** push to `main` on `git@github.com:troscianko/jolyon.git` — the
workflow in `.github/workflows/pages.yml` builds and deploys automatically. One-off setup: in
the GitHub repo's Settings → Pages, set "Source" to "GitHub Actions".

**Your own server (fallback):** build locally and rsync the output over, e.g.:

```sh
bundle exec jekyll build
rsync -avz --delete _site/ user@yourserver:/path/to/webroot/
```

No code changes are needed to switch between the two — both just consume the same `_site/`
build output.
