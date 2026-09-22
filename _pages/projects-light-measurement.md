---
title: "Light Measurement Tools"
slug: light-measurement-tools
permalink: /projects/light-measurement-tools/
eyebrow: "Project"
---

## Open source & low-cost spectroradiometry
 
Eyes detect light, so measuring the intensity and spectrum of light is crucial for much of my work in visual ecology. Standard spectroradiometers — the instruments that measure light — are expensive, difficult to use, and few are sensitive enough to work at real night-time light levels. This is a serious problem for working out how artificial light at night (ALAN) affects animal behaviour at night, or calibrating field or experimental conditions to test for the impact of ALAN.
 
So I built two open-source instruments to fill this gap: **OSpRad**, a low-cost, high-sensitivity spectroradiometer, and **HOSI**, a hyperspectral imaging system built around the same core sensor. Together they let researchers measure not just how bright a light is, but its full spectral range, down to levels far dimmer than most commercial equipment can register.

![](/assets/images/pages/projects-light-measurement/osprad-photo.jpg)

 
## OSpRad: a high-sensitivity spectroradiometer
 
OSpRad is built around the Hamamatsu C12880MA, a miniature spectrometer chip originally designed for medical devices, repurposed here for ecology. On its own it's just a bare component; OSpRad wraps it in an Arduino-controlled housing with a motorised shutter and a cosine corrector using 3D-printed parts, for a total build cost of around £250–300.
 
The result covers roughly 310–880 nm with about 9 nm resolution, and — critically — it's sensitive enough to measure spectral radiance down to around 0.001 cd/m², and irradiance down to about 0.005 lx. That's below moonlight and close to starlight, comfortably covering the range of real night-time light levels that matter for ALAN research, from distant streetlights to sky-glow.
 
Some key features make this far more useful than typical lab equipment:
 
- **Plugs into a phone.** The whole thing is controlled by a Python app that runs equally well on a laptop or an Android smartphone, making it properly field-portable.
- **Automated measurement.** The firmware ramps up integration time until it's just short of saturation, then takes a matched dark-frame measurement to subtract sensor noise — the same trick long-exposure astrophotographers use, applied here in software, automatically, every time.
- **Nothing is thrown away.** Every measurement is saved with its raw sensor counts alongside the calibrated values, so data can be recalibrated later without repeating fieldwork.
OSpRad was published in the *Journal of Experimental Biology* in 2023, and it's already been used to study how artificial lighting reshapes the "landscape of fear" for an endangered shorebird — exactly the kind of question that needed a sensitive, affordable spectroradiometer to even ask.
 
**Download [OSpRad on GitHub](https://github.com/troscianko/OSpRad)**

Citation: Troscianko, J. (2023). 'OSpRad: an open-source, low-cost, high-sensitivity spectroradiometer', _Journal of Experimental Biology_, 226(13), jeb245416 [https://doi.org/10.1242/jeb.245416](https://doi.org/10.1242/jeb.245416)

----
 
## HOSI: hyperspectral imaging
 
![](/assets/images/pages/projects-light-measurement/hosi-butterfly.jpg) 

OSpRad measures one point at a time, which is perfect for many purposes but limiting if you want to understand a whole visual scene — say, how a streetlight, the sky, and a patch of vegetation compare spectrally, all at once. That's what **HOSI** (the Hyperspectral Open Source Imager) is for.
 
HOSI takes the same core spectrometer chip and mounts it on a motorised pan-tilt gimbal, scanning it point by point across a scene to build a full hyperspectral image — where every single pixel carries a complete spectrum, not just a colour. It's built from the same kind of off-the-shelf parts and 3D-printed housing as OSpRad, for a total cost of around £350, and runs from the same kind of lightweight desktop or smartphone interface.
 
Because each pixel is captured with its own independent exposure, HOSI achieves an extraordinary dynamic range — sample night-time scans have shown peak-to-peak ratios exceeding 50,000:1, letting it capture a scene containing both a bright streetlamp and near-total darkness without either blowing out or disappearing into noise. It shares OSpRad's sensitivity (down to around 0.001 cd/m²) across the same 320–880 nm range, with a spatial resolution of about 0.2 degrees per pixel.
 
In practice, this means being able to point HOSI at a harbour, a street, or a patch of habitat at night and come away with a full hyperspectral panorama: not just an image, but a dataset in which any pixel's exact light spectrum can be examined and compared, individual light sources identified, and the whole night-time light environment characterised in a way no standard camera can manage. HOSI was published in *BMC Biology* in 2025.

**Download [HOSI on GitHub](https://github.com/troscianko/HOSI)**

Citation: Troscianko, J. (2025). A hyperspectral open-source imager (HOSI), _BMC Biology_, 23(1), 5 [https://doi.org/10.1186/s12915-024-02110-w](https://doi.org/10.1186/s12915-024-02110-w)

![](/assets/images/pages/projects-light-measurement/hosi-wiring-parts.jpg) 
 
### Free & open source
 
Both instruments take a sensor that's normally locked away behind expensive, closed instrumentation, and rebuild it openly, cheaply, and with a user interface simple enough to run from a phone in a field site at midnight. All of the code, 3D-printable parts, wiring diagrams, and calibration data for both projects are free and open source, so any lab (or curious individual) can build their own.
 
**[OSpRad on GitHub](https://github.com/troscianko/OSpRad)** · [Read the paper (J. Exp. Biol., 2023)](https://doi.org/10.1242/jeb.245416)
 
**[HOSI on GitHub](https://github.com/troscianko/HOSI)** · [Read the paper (BMC Biology, 2025)](https://doi.org/10.1186/s12915-024-02110-w)
