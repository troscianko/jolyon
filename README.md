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

## Adding photos / a photo gallery

Drop images anywhere under `assets/images/` (they don't need to belong to a post). For any
image, add an optional sidecar Markdown file with the *same name* to give it a title, excerpt,
and caption — e.g. `butterfly_01.jpg` + `butterfly_01.md`:

```yaml
---
title: "Red admiral"
excerpt: "Resting on yellow ragwort"
---

Any Markdown here becomes the caption shown below the photo in the full-size lightbox view
(not the small overlay).
```

If there's no sidecar `.md` file, the image just has no title/excerpt/overlay — it's still
viewable full-size. See `assets/images/site/butterflies/` for a working example.

To turn a whole folder of images into a gallery, add this to any page or post:

```liquid
{% include gallery.html dir="/assets/images/site/butterflies" thumb_width=200 %}
```

- `dir` — the folder, as a site-root path (no trailing slash).
- `thumb_width` — grid thumbnail width in px (default 200).
- `overlay=false` — add this to hide the title/excerpt overlay for every photo in that gallery.

Wherever a managed photo appears (gallery, a post's hero image, or just embedded inline in a
post/page with normal `![alt](path)` Markdown), clicking it opens a full-width lightbox with
the title/excerpt/caption shown below the image and arrow buttons to step through every other
photo on that page (or, for a `gallery.html` block, through just that gallery). Post-card
thumbnails on the homepage/theme pages are the one exception — they stay as plain links to
their post.

Real thumbnail/display-size image files are generated automatically at build time (see
`_plugins/photos.rb`) — you never need to resize images yourself, and the generated files
(`assets/images/derived/`) aren't committed to git.

## Editing the fixed pages

The research/project/Animal Vision/Outreach pages live in `_pages/`, one file each, with a
`slug:` that matching posts' `themes:` reference. Edit the placeholder text (marked
`> TODO:`) directly. `_data/publications.yml` and `_data/funding.yml` drive the Publications and
Funding pages — edit those data files rather than the page templates. Each entry can
optionally have an `image:` (shown to the right, same thumbnail pipeline as galleries) and a
`description:` (Markdown — link to a related post, media coverage, code/data, etc.), shown
indented below the citation. See the example entries already in those files.

The menu itself is `_data/navigation.yml`.

## One-off setup (Ubuntu)

```sh
sudo apt update
sudo apt install -y ruby-full build-essential zlib1g-dev imagemagick

# Install gems into your home directory instead of system-wide (no sudo needed after this).
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

gem install bundler
cd /home/jolyon/Documents/Work/Websites/jolyon
bundle install
```

## Preview locally

```sh
bundle exec jekyll serve
```

Visit http://localhost:4000 — it rebuilds automatically as you edit files. `bundle exec jekyll
build` (no `serve`) just builds `_site/` once without watching, and is a good way to catch
errors before deploying.

## Deploying

Two things happen, independently:

1. **GitHub Pages (live preview/mirror):** push to `main` and
   `.github/workflows/pages.yml` builds and deploys automatically — no local steps needed.
   One-off setup: in the GitHub repo's Settings → Pages, set "Source" to "GitHub Actions". This
   only works because the repo is public; if you ever make it private again this stops working
   unless you're on a paid GitHub plan.
2. **Your own server (the "real" site, jolyon.co.uk):** build locally and rsync the output
   over:

   ```sh
   bundle exec jekyll build
   rsync -avz --delete _site/ user@yourserver:/path/to/webroot/
   ```

   `--delete` removes files on the server that no longer exist in `_site/` (e.g. after you
   delete a post) — drop it if you'd rather old files stuck around instead.

Both consume the same `_site/` build output, so there's nothing to keep in sync between them
beyond just doing both after a change.
