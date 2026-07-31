# Tech Specs — 8K HDR Production Build

This project in `/film` currently contains a 720p animatic rendered from 10 photoreal AI plates (1408x768) + placeholders, edited with Ken Burns. To scale to true 8K HDR ray-traced deliverable for Tehran location shoot, follow pipeline:

### 1. Camera Package
- **Hero:** ARRI Alexa 65 (6560x3100 Open Gate) + ARRI Signature Prime 28/35/47/58/85
- **Macro:** Laowa 24mm Probe + ARRI Q A-Macro 100mm for dive into concrete core sample
- **Aerial:** Freefly Alta X + RED V-Raptor 8K VV (8192x4320) with 25mm and 50mm
- **High Speed:** Phantom Flex4K for rain split (1000fps at 4K)

### 2. Location Plan Tehran (Real)
- Day 1 05:30 Alborz drone — Hemmat Highway overlooking Milad Tower, AQI >150 target
- Day 1 16:00 Street POV — Khayyam, Haft-Tir, Valiasr gimbal walk
- Day 2 10:00 White wall — Build 3x12m demo wall with SCC patent mix, cure 28 days prior, place on empty lot on Keshavarz Blvd for contrast shoot
- Day 3 Rain — artificial rain rig + real rain backup Ordibehesht season, shoot split-screen practical side-by-side wall dirty vs clean
- Day 4 Miniature lab — shoot actual core sample under SEM at Sharif University, export displacement maps

### 3. Photocatalytic Material Sample for Shoot
- Mix: OPC Type II + 5% anatase nano-TiO2 (Evonik P25), 3% activated carbon (coconut shell, 900 m2/g), white pigment TiO2 micro, w/c 0.35
- Cast as 3 panels 1.5x3m, polish face, protect edges
- Application mock: highway Jersey barriers cast with same mix, bridge column cladding

### 4. VFX — Photoreal Restriction
- **NOx Drift:** Practical dry ice fog in black stage lit with hard 10K, shot 8K, tracked back into street plate — no particle sim.
- **Time Freeze:** Bolt array 15x RED Komodo on circular rig, shoot at 120fps, freeze stitch.
- **Macro Dive:** Photogrammetry of real concrete thin section (30 micron) scanned at 100MP, Houdini VDB for pores but driven by real SEM mesh. Render mantra with spectral.
- **Molecular:** Molecular dynamics in LAMMPS, accurate van der Waals radii, render with Redshift spectral subsurface.
- **Earth Orbit:** NASA Blue Marble 8K texture + real ISS footage blend, volumetric atmosphere in NukeX.

### 5. HDR Grade
- ACEScg workspace, DaVinci Resolve
- Dolby Vision 4000 nits master
- Three LUTs as in script: Dark/Brown (Tehran smog), Clean White, Tehran Blue (final)
- Grain: LiveGrain 65mm 5219 halation, no denoise until final render

### 6. Sound
- Field record Tehran with Sound Devices 888 + Sennheiser Ambeo, DPA 4060 for breath
- Orchestra: Budapest Scoring, 32 strings, record at 96kHz
- Final breath: single take, no plug — raw

### 7. Deliverables Upgrade from Current 720p Animatic
Current files:
- `THE_CITY_THAT_BREATHES_TEHRAN_720p.mp4` — 62s animatic no audio, Ken Burns
- `THE_CITY_THAT_BREATHES_TEHRAN_FINAL.mp4` — same + voiceover tags (Every breath matters + final tag + breath)

To upgrade to 8K, replace each 1408x768 plate with 8K location plate, keep same edit EDL exported from this project (`film/video/EDL.txt`).

### 8. Patent End Card
Use registered font: SF Pro Display Thin, 48pt tracking 75, center. Logo area 400x200px safe. Background pure white P3 D65 255,255,255 — not 252.

### 9. AI Placeholder Notice
10 of 14 stills in `/film/images/` were generated with AI photoreal model to simulate location before shoot. They are NOT final assets — they are pre-viz. Final must be real Tehran footage.

- scene02,03,04,05,06,07,08,09,10,11 = AI generated (photoreal target)
- scene01,12,13,final = programmatic placeholder (to be shot)

Replace with real before public release.

### 10. Next Steps
1. Print storyboard `STORYBOARD.html`
2. Secure Tehran permit for drone + wall demo
3. Cast concrete panels (28 day lead)
4. Book Alexa 65 package + Freefly Alta
5. Shoot 4 day schedule
6. VFX 3 week for molecular
7. Grade Dolby Vision

Contact: Production SCICO
