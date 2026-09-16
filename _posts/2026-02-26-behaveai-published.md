---
title: "BehaveAI Published"
image: /assets/images/pages/projects-behveai/gull-demo.jpg
excerpt: "BehaveAI: video analysis tool enables rapid detection and classification of objects and behavior from motion"
themes: [visual-modelling, behaveai]
---

BehaveAI is a biologically inspired video analysis framework that integrates static and motion information through a novel color-from-motion encoding strategy. It converts object movement—direction, speed, and acceleration—into color gradients, meaning both human annotators and pre-trained convolutional neural networks (CNNs) can infer motion patterns while retaining high-resolution spatial details.

Using a range of case studies, we demonstrate how the increased salience of motion information allows for the robust detection of objects that are challenging or impossible to identify reliably from static frames alone, particularly in complex natural scenes. We further demonstrate the reliable classification of different behaviors in animals and single-celled organisms. Additionally, the framework supports flexible hierarchical model structures that can separate the tasks of detection and classification for optimal efficiency, and provide individual tracking data that specifies what is present where and what it is doing in each frame.

The framework makes use of the latest deep learning architecture (YOLO), combined with a semi-supervised annotation workflow. Together with salient motion information, these features can dramatically reduce the effort required for dataset annotation such that reliable models can often be made within an hour. Moreover, smaller annotation datasets mean that model training can be achieved on conventional computers without dedicated hardware, thereby improving accessibility. The motion encoding approach is also computationally lightweight, and can run in real-time on low-end edge devices such as a Raspberry Pi. We release the framework as a free, open source, and user-friendly package.

The paper has just been published in [**PLoS Biology**](https://doi.org/10.1371/journal.pbio.3003632)
[BehaveAI GitHub download](https://github.com/troscianko/BehaveAI/), [User guide](https://github.com/troscianko/BehaveAI/wiki)


### Video introduction:
<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/YQG4497kzPY"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>


