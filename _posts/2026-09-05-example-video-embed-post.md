---
title: "Example post: embedding a YouTube video"
image: /assets/images/posts/example-video-embed-post/main.jpg
excerpt: "Shows how to drop raw HTML — like a YouTube embed — straight into a Markdown post."
themes: [visual-modelling]
---

Markdown posts can contain raw HTML directly — useful for embedding video, for example:

<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

Just paste an embed's HTML (from YouTube's Share → Embed option, for instance) directly into
the Markdown file where you want it to appear — no special syntax needed.

You can also write a whole post as raw HTML instead of Markdown: just save the file with a
`.html` extension instead of `.md` (same front matter block at the top).
