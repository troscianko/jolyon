---
title: "BehaveAI Orientation"
image: /assets/images/posts/behaveai-orientation/behaveai-orientation.png
excerpt: "BehaveAI update adds orientation measurement, making it easy to measure the angle of your animal/object"
themes: [visual-modelling, behaveai, experimental-tools]
---

BehaveAI v1.4 can now detect and measure the orientation of tracked objects and animals, not just their location. This update adds YOLO oriented bounding boxes (OBB, rotated boxes that hug the actual angle of the object) and automatically calculates a heading/orientation angle for every detection, frame by frame.

What's new:

- Detections use rotated (oriented) bounding boxes instead of standard axis-aligned ones
- BehaveAI calculates the angle of each detected object automatically
- Works alongside BehaveAI's existing motion-based detection and multi-individual tracking


Why it's useful:
Orientation is often the behaviour itself — which way an animal is facing, how it's turning, whether individuals are aligned with each other or with a stimulus.


<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/FgmtHoardWg"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

BehaveAI is free and open source (AGPL-3.0), built around YOLO, and runs on low-end hardware without a GPU.

[BehaveAI GitHub download](https://github.com/troscianko/BehaveAI/), [User guide](https://github.com/troscianko/BehaveAI/wiki)
