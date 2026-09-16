---
title: "BehaveAI"
slug: behaveai
permalink: /projects/behaveai/
eyebrow: "Project"
reaction:
  text: stripes
  background: spots
  text_alpha: 0.0      # default 0 (invisible)
  pattern_alpha: 1.0   # default 1 (opaque) — needs to drop below 1 for text_alpha to show through
  decay: 0.95          # default 0 (no smoothing) — try 0.7-0.95 for visible trails
  attraction: 1.8      # default 0 (free drift) — try 0.5-2, it needs to be much bigger than feed/kill values to matter
---

![]({{ "/assets/images/pages/projects-behveai/behaveai-1200-banner.png" | relative_url }})

## BehaveAI: Detecting animal behaviour from motion

Videos are a crucial tool for behavioural research because they can show what an animal is _doing_ and how this changes and responds over time. Despite decades of advances we lacked automated tools for extracting this information reliably and effectively. This led me to build **BehaveAI**, a free, open-source framework for detecting, classifying, and tracking animals — or any moving object — directly from video.

![]({{ "/assets/images/pages/projects-behveai/fly-behaviour.jpg" | relative_url }})

### Seeing motion the way the brain does

Most computer vision tools trained to spot animals work purely from static appearance, much like a single photograph. But behaviour is normally best described by *how* something moves, not just what it looks like. BehaveAI's key idea is to turn motion itself into something a neural network — and a human annotator — can read at a glance: motion is converted into a kind of false-colour image and combined with the animal's static appearance. This loosely mirrors the way the mammalian visual system separates motion processing from object recognition, and it lets the underlying model, built on the widely used YOLO (You Only Look Once) architecture, pick up on behavioural cues that appearance alone would miss.

![]({{ "/assets/images/pages/projects-behveai/gull-demo.jpg" | relative_url }})


**[Download from GitHub](https://github.com/troscianko/BehaveAI)**

**[Read the user guide](https://github.com/troscianko/BehaveAI/wiki)**


### Video introduction:

<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/YQG4497kzPY"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

### Annotate & train quickly & easily

The time taken to annotate datasets and train models is a key bottleneck to using deep neural nets. Most machine-learning pipelines need thousands of painstakingly labelled examples before they're any use. BehaveAI instead uses semi-supervised annotation: you label a handful of frames, let an initial model take a first pass at the rest, then quickly correct its mistakes rather than starting from scratch. In practice, that means a usable tracking model can be built in under an hour, even for users with no machine-learning background.

It's also built to handle the cases that usually break motion-tracking software: targets as small as two pixels, fast-moving or motion-blurred animals, and scenes with several individuals, each tracked and classified independently. A newly added feature lets it track orientation too — the angle an animal is facing as it moves — useful for anything from courtship displays to flight paths.

### Lightweight & can run in real-time on low-end hardware

BehaveAI runs comfortably on low-end hardware with no dedicated GPU required, and there are ready-made installers for Windows, Linux (including Raspberry Pi), and macOS. It also supports live, "edge" processing, so a model trained on your footage can run in real time out in the field, or int he lab with only a computer and webcam.

### Open source & peer-reviewed

The whole framework is free and open source under the AGPL license, and the method behind it was published in *PLOS Biology*. Whether you're studying insect flight, mammal behaviour, or anything else that moves in front of a camera, the code, documentation, and a full user guide are all on GitHub - check it out:

**[Download from GitHub](https://github.com/troscianko/BehaveAI)**

**[Read the user guide](https://github.com/troscianko/BehaveAI/wiki)**


## Video user guide:

<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/atEL14nxz9s"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

## Measure orientation:

BehaveAI v1.4 can now detect and measure the orientation of tracked objects and animals, not just their location. This update adds YOLO oriented bounding boxes (OBB, rotated boxes that hug the actual angle of the object) and automatically calculates a heading/orientation angle for every detection, frame by frame.

<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/FgmtHoardWg"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

