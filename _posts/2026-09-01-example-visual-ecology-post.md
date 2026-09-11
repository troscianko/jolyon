---
title: "Example post: how to write one of these"
image: /assets/images/posts/example-visual-ecology-post/main.jpg
excerpt: "A worked example of a Markdown post, showing the front matter fields the site uses."
themes: [visual-ecology]
---

This is an example post — delete it once you've got a feel for the format, or keep it as a
template to copy.

## Front matter

Every post needs this block at the top of the file, between `---` lines:

```yaml
title: "Your post title"
image: /assets/images/posts/your-post-slug/main.jpg
excerpt: "One sentence shown in the homepage carousel and theme pages."
themes: [visual-ecology, light-pollution]
```

- `image` is the main photo used for the post's card everywhere it's listed.
- `excerpt` is the one-line description shown alongside that image.
- `themes` is a list of slugs — see each research/project page for its slug (e.g.
  `visual-ecology`, `visual-modelling`, `light-pollution`, `behaveai`, `micatoolbox`,
  `light-measurement-tools`, `experimental-tools`, `animal-vision`, `outreach-media`). A post
  can list more than one.

## Body

The rest of the file is normal **Markdown** — headings, `*italics*`, `[links](#)`, and images:

![A placeholder leaf photo](/assets/images/posts/example-visual-ecology-post/main.jpg)

Put any extra images for this post in the matching folder under
`assets/images/posts/<this-post's-filename-without-the-date>/`.
