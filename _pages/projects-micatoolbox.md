---
title: "micaToolbox"
slug: micatoolbox
permalink: /projects/micatoolbox/
eyebrow: "Project"
---

![](/assets/images/pages/projects-micatoolbox/micaToolboxLogoMKIIlarge.png)


# micaToolbox & QCPA: Quantifying Colour and Pattern in Animal Vision

Digital cameras are powerful tools, but they are built entirely around human vision — three colour channels, tuned to how *we* see — so a raw photograph can't reliably tell you as how a colour pattern actually appears to a bird, a fish, or an insect, whose eyes may have entirely different numbers and types of photoreceptors, different sensitivity into the ultraviolet, and different spatial resolutions. Comparing "redness" or "contrast" between two uncalibrated photos isn't reliable either, since pixel values shift with lighting, exposure and the camera's own non-linear response.

That's the problem **micaToolbox** and **QCPA** were built to solve. micaToolbox turns ordinary digital cameras into calibrated measuring instruments and translates images into other species' visual systems; QCPA extends that calibrated output into a full framework for analysing colour *pattern*, not just colour. Both are free, open-source plugins for ImageJ, a widely used scientific image-analysis platform, and both are documented at [empiricalimaging.com (user guides, videos, forum)](http://www.empiricalimaging.com)

![](/assets/images/posts/phd-position-advertised/lapwing-montage.jpg)


## micaToolbox: from photograph to visual measurement

micaToolbox converts RAW photos from a wide range of consumer camera models into images that are linear with respect to radiance, then normalises them against grey standards included in the photo to control for changes in lighting between photos. This alone addresses a problem that's easy to overlook: without it, colour and brightness measurements from photographs aren't comparable to one another.

From there, the toolbox can:

- **Combine multispectral images**, stacking, for example, a standard visible-light photo with one taken through a UV-pass filter, so that a single multispectral image spans a wider range than any single photo could capture.
- **Convert images into "cone-catch" images** — representing what a given animal's visual system would register — using measured camera and lens spectral sensitivities together with photoreceptor sensitivity data for a range of species, from birds and reptiles to insects and fish.
- **Quantify colour and pattern differences** using models grounded in visual psychophysics, such as just-noticeable-difference (JND) calculations for colour and luminance, GabRat (a measure of how well a pattern disrupts an object's outline, relevant to disruptive camouflage), and AcuityView (which simulates how a scene appears once a receiver's spatial acuity and viewing distance are taken into account).

## QCPA: analysing pattern as well as colour

Colour and pattern are usually studied separately, even though most real signals — camouflage, warning colouration, mate choice displays — depend on both together. QCPA (Quantitative Colour Pattern Analysis) builds on the toolbox's calibrated cone-catch images to analyse them jointly, introducing a pipeline of new and established techniques:

- **Spatial acuity modelling**, which blurs an image to reflect what detail would actually be resolvable at a given viewing distance for a given visual system, followed by a receptor-noise-limited (RNL) filtering step that restores sharp edges lost during blurring — closer to how a real visual system would perceive smoothed, but still defined, boundaries.
- **RNL clustering**, which segments an image into discrete colour/pattern classes using psychophysical discrimination thresholds rather than arbitrary pixel similarity, so the boundaries the analysis works with are ones the animal could plausibly perceive as boundaries.
- **Established pattern statistics adapted for calibrated images**, including Boundary Strength Analysis (edge contrast weighted by boundary length), Colour Adjacency Analysis (how often different colour/pattern classes border one another) and Visual Contrast Analysis.
- **Local Edge Intensity Analysis (LEIA)**, a new pattern statistic introduced alongside the framework.

The result is a route from a calibrated photograph through to quantitative colour-pattern statistics scaled in units that reflect a specific visual system's actual discrimination ability, rather than raw pixel differences.

## Use in research

Both tools are aimed at behavioural and evolutionary ecology, and have been applied across a broad range of questions, accumulating hundreds of citations each: examples include predator detection and disruptive camouflage, colour polymorphism and signal conspicuousness, eggshell colouration and patterning in relation to brood parasitism or nest predation, and floral colour as seen by pollinators. Because the underlying models can be swapped for different species' photoreceptor data, the same pipeline is used across a huge range of visual systems and taxa, rather than being specific to one study system.

Both tools remain free and open source, released under a Creative Commons licence, with the request that users cite the relevant papers: Troscianko & Stevens (2015, *Methods in Ecology and Evolution*) for MICA, and van den Berg, Troscianko, Endler, Marshall & Cheney (2019/2020, *Methods in Ecology and Evolution*) for QCPA.

**[micaToolbox on GitHub →](https://github.com/troscianko/micaToolbox)** · [empiricalimaging.com (user guides, videos, forum)](http://www.empiricalimaging.com)

**Read the papers:** [MICA (Methods Ecol. Evol., 2015)](https://doi.org/10.1111/2041-210X.12439) · [QCPA (Methods Ecol. Evol., 2020)](https://doi.org/10.1111/2041-210X.13328)
