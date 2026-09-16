---
title: "Visual Modelling"
slug: visual-modelling
permalink: /research/visual-modelling/
eyebrow: "Research theme"
reaction:
  text: spots
  background: spots
  text_alpha: 1      # default 0 (invisible)
  pattern_alpha: 1  # default 1 (opaque) — needs to drop below 1 for text_alpha to show through
  decay: 0.3          # default 0 (no smoothing) — try 0.7-0.95 for visible trails
  attraction: 1.2     # default 0 (free drift) — try 0.5-2, it needs to be much bigger than feed/kill values to matter
  pattern_colour: "#606060"
---

## Visual modelling


I have always been fascinated by vision as a sense; it lets us inspect tiny things up close, or vast galaxies far away. Our subjective experience as humans is incredibly visual and vivid, giving us the false belief that our eyes are a faithful window to the world outside our bodies. But – spoiler – they are not! Our eyes are severely limited, only capturing a tiny proportion of the information available, and then processing it in lossy, limited ways. Other animals have vastly different eyes and brains, so their experiences will be wildly different to our own. Being able to see the world through other animal’s visual systems is therefore not only deeply thought provoking, it’s also vital for understanding many aspects of animals’ lives. So visual modelling (LINK) is a major aspect of my work.

### Colour vision

Attempting to objectively infer another animal’s subjective visual experience is a difficult task, but we can quite reliably model how the receptors in an animal’s eye respond to light. I have developed a range of tools for doing this with digital cameras (micaToolbox LINK), and have created open-source spectroradiometers and imagers (hardware & software LINK). This allows us to quantify the colours visible to another animal, including extending spectral sensitivity in to the ultraviolet range (a portion of the spectrum that we can’t see, but that many other animals can).

The next steps are much more messy. We need to convert the colours seen by different eyes into relevant colour spaces, and integrate colour with pattern (spatial vision) and/or time (motion vision).

### Spatial vision

The spatial arrangement of colour patterns give rise to the most wonderful displays in nature, from vivid sexual signals and warning colours, to camouflage that matches the exact patterns and colours of an animal’s surrounds. Many displays will even have dual-functions, acting as signals up close, but blending in with the environment perfectly from a distance (e.g. the black-and-yellow warning stipes on a caterpillar will blend together and make a background-matching brown from a distance). I’ve developed a wide range of tools that can objectively measure colours and their spatial arrangements simultaneously (spatio-chromatic modelling). This includes the QCPA framework with a whole host of tools, GabRat for quantifying edge disruption, distance-dependent modelling, and various pattern analysis tools.

We like to imagine colours can be expressed in ‘colour spaces’, but colour appearance actually depends on spatial (and temporal) information too. For example, place a grey disk on a red-ish background and it will look green-shifted, now move the same grey disk to a green-ish background and it will look red-shifted. This effect is called simultaneous contrast, and we’ve been aware of it for about 1,000 years. But now if you step back or use smaller disks, and make the backgrounds more intense red and green, the disk’s perceived colours will flip the other way; the disk on the green background looking more green and vice-versa, called assimilation (or White’s illusion). Existing visual modelling likes to ignore these dramatic effects, however I have developed a comparatively low-level visual model (the spatio-chromatic bandwidth limited model) that can predict and quantify them. 

### Motion vision

Motion is very ‘easy’ for visual systems to detect; think of a camouflaged animal moving and suddenly being easy to spot. However, it’s much more difficult for visual system to convert this detected change in brightness into estimations of the speed and direction of a moving object. High contrast spots and stripes can interfere with the way the basic mechanisms of motion detection work. I have developed methods that simulate how ‘elementary motion detectors’ work, and have used these to show how butterfly wing markings blend with wing dynamics to confuse birds.

# OLD

Digital cameras are extremely powerful tools for recording spatial information across different wavelengths, but for testing biological hypotheses we generally need to know what a scene will look like to an animal, not our camera. To do this we use a number of image processing techniques and camera calibration procedures. We have released a software toolbox that enables easy objective image analysis. The toolbox can be downloaded from [here](http://www.jolyon.co.uk/myresearch/image-analysis/image-analysis-tools/).

![This photo shows a set of grey standards we use to linearise cameras, with reflectance values ranging from 2% to 99%. They are made a spectralon - one of the most diffuse substances known - basically non-stick plastic that's been powdered and squished together with a bit of heat (sintered), then mixed with charcoal to get the grey level.](/assets/images/pages/research-visual-modelling/grey-standards.jpg)

This photo shows a set of grey standards we use to linearise cameras, with reflectance values ranging from 2% to 99%. They are made a spectralon – one of the most diffuse substances known – basically non-stick plastic that’s been powdered and squished together with a bit of heat (sintered), then mixed with charcoal to get the grey level.

### Linearisation

First, we need linearised images, where a pixel value twice as high as another in a given channel corresponds to twice the irradiance falling on the sensor. This is not normally the case with digital photographs, as cameras can capture a much larger working range of intensities than print or monitors can recreate.

### Normalisation

Lighting conditions change continually – e.g. with atmospheric conditions or time of day – but we need to be able to compare one photo to another taken under different conditions. To do this we use a diffuse (very matt surface) grey standard in the photo to measure the colour of the grey as perceived by the camera. The camera colour channels are then linearly re-levelled so that the grey standard has an equal value across all channels. This is similar to our eyes adapting to ambient lighting conditions (e.g. a tungsten bulb will look very orange when you walk from a flourescent-tube lit room, but that orange-ness will fade over a few seconds/minutes and white things will look white again).

### Cone-mapping

The colour receptors (cones) of different animals are sensitive to different wavelengths, meaning they see the world in completely different ways. Most humans can see red, green and blue (trichromats), while most other mammals can’t see the difference between red and green (dichromats), and our relatively big eyes block out much of the ultraviolet light, meaning smaller mammals are likely to see further into UV than us. Birds see in four colours (tetrochromats) broadly split into those that see in UV or deep violet, and their cones are further tuned by oil droplets that act like tiny filters in their retinae. In order to convert photographs from digital camera vision to animal vision we need to know the sensitivity of our camera and the animal’s cones to different wavelengths of light. Then we take a database of thousands of natural colour spectra and generate a model that maps from the colours of the camera to the colours of our animal.

![Sensitivitity Graph Human](/assets/images/pages/research-visual-modelling/Sensitivitity-Graph-Human.png)

We humans evolved from dichromatic mammals, with our “yellow” sensor splitting into a longer (red) and shorter (green) sensor. This is really handy for seeing red things against a green background, and foraging for fruit and new shoots on plants is thought to have been a driver of our trichromatic vision. But our red and green sensitivities (left) are quite overlapping.

![Sensitivitity Graph Bluetit](/assets/images/pages/research-visual-modelling/Sensitivitity-Graph-Bluetit.png)

Bluetits have nicely separated spectral sensitivities thanks to the oil droplets in their eyes that filter out certain colours. They can also see in ultraviolet, so if we want to see what the world looks like to a bluetit we need a UV-sensitive camera.

![Bluetit](/assets/images/pages/research-visual-modelling/Bluetit.png)

### Image Processing

Once we’ve got animal “cone-catch” images there are loads of different analyses we can do. These broadly fall into a few different categories: luminance and contrast, pattern, edge disruption, and colour.
