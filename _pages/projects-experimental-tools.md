---
title: "Experimental Tools"
slug: experimental-tools
permalink: /projects/experimental-tools/
eyebrow: "Project"
reaction:
  text: stripes
  background: spots
  text_alpha: 0.0      # default 0 (invisible)
  pattern_alpha: 1.0   # default 1 (opaque) — needs to drop below 1 for text_alpha to show through
  decay: 0.95          # default 0 (no smoothing) — try 0.7-0.95 for visible trails
  attraction: 0.8      # default 0 (free drift) — try 0.5-2, it needs to be much bigger than feed/kill values to matter
---

We're always developing a range of tools, hardware and software, to help with my research. Check out my [GitHub](https://github.com/troscianko) page.

## CamoEvo – rapid camouflage evolution

We have developed a Genetic Algorithm (GA) that combines human psychophysics experiments with recent advances in GA technology to rapidly evolve target camouflage. The GA allows explicit testing of a range of camouflage strategies and theories, and can simulate important population-level evolutionary strategies (such as polymorphisms).

<div class="video-embed">
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/D6bD8HtSFKg"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

![](/assets/images/posts/camoevo/egg-evo.png)

[Find out more here](/posts/camoevo-toolbox/)
 
----

## Optomotor drum

I developed an optomotor drum system that can be used to measure animals' spatial or temporal acuity. 

Published here: [Caves et al. (2020) A customizable, low-cost optomotor apparatus: a powerful tool for behaviourally measuring visual capability — _Methods in Ecology and Evolution, 11(10)_ ](https://doi.org/10.1111/2041-210X.13449)

{% include gallery.html dir="/assets/images/pages/projects-experimental-tools/optomotor" thumb_width=300 %}

----

## Egg shape measurement

I've developed a useful tool for measuring the volume, surface area and shape of eggs from digital images. These tools are built into the micaToolbox for easy egg measurement. [More info here](/posts/egg-shape/).

![](/assets/images/posts/egg-shape/egg-shape-examples.png)

