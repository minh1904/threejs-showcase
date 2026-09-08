# threejs-showcase

An interactive site where each lesson from a self-directed Three.js curriculum ships as a live demo. Built to close one gap: a Front-End / Web 3D Developer role that lists hands-on Three.js as a hard requirement.

The curriculum lives in **[`docs/LO-TRINH.md`](docs/LO-TRINH.md)** — 38 lessons across 6 modules, in Vietnamese, each with an exercise and a "done when" bar.

## Approach

**Vanilla Three.js first, React Three Fiber second.** R3F is a wrapper; it hides the animation loop, resize handling and disposal. Learning those by hand first means being able to explain what R3F does rather than only how to call it. Modules 1–3 are vanilla inside `useEffect`; the port to R3F happens in Module 4, deliberately as a side-by-side comparison with code that already works.

**Every performance claim comes with a number.** Module 5 exercises require recording draw calls and FPS before and after each optimisation — 1000 individual meshes versus one `InstancedMesh`, shadow map sizes, texture resolutions, desktop versus a real phone. "Draw calls went from 1000 to 1 and FPS from X to Y" is a very different answer than reciting a definition.

**Break it on purpose.** Most exercises include a step that induces the bug before fixing it: z-fighting from a bad `near` plane, a moon detached from its parent group, animation that doubles in speed at 120Hz, a stretched viewport from a missing `updateProjectionMatrix()`, memory that climbs when `dispose()` is skipped, transparent planes that vanish behind each other.

**The site stays dumb.** Lesson content is plain JSX — no MDX, no CMS. Building a content system is the comfortable, familiar work, and it is not the point.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| 3D | three 0.185 · @react-three/fiber 9 · @react-three/drei 10 |
| State | zustand — read inside `useFrame` without triggering a re-render |
| Debug UI | lil-gui (vanilla lessons) · leva (R3F lessons) |
| Profiling | r3f-perf (dev only) |
| Package manager | bun |

Two debug UIs on purpose: leva is React-only and cannot drive the vanilla lessons, while lil-gui works in both and matches what the official Three.js docs use, so tutorial code carries over unchanged.

## Curriculum

| Module | Topic | Lessons |
|---|---|---|
| 1 | Vanilla fundamentals — scene, geometry, transforms, animation loop, controls, debug UI, deploy | 7 |
| 2 | Materials, lights, shadows, textures, environment maps, colour management, transparency | 7 |
| 3 | glTF/GLB models — loading, progress and error states, Draco/KTX2 compression, animation | 4 |
| 4 | Raycasting, the port to R3F, drei, events, zustand, camera transitions, HTML+WebGL, code structure | 8 |
| 5 | Measurement, draw calls and instancing, model optimisation, mobile, memory, on-demand rendering | 6 |
| 6 | Particles, render targets, post-processing, shaders (optional), scroll animation, ship it | 6 |

The roadmap was drafted from experience, then cross-checked against Three.js Journey, the official Three.js manual, Discover three.js, SimonDev and several community roadmaps. That pass added seven topics the first draft had missed — colour management and tone mapping, transparency and draw order, mixing HTML with WebGL, code structure, on-demand rendering, particles and render targets — and it also settled what to leave out. The appendix at the end of the roadmap records which sources were checked and why each omission was deliberate.

## Running it

```bash
bun install
bun dev          # http://localhost:3000
bun run build
bun run lint
```

## Agent skills

`.agents/skills/` carries 13 installed skills, managed by [`npx skills`](https://github.com/vercel-labs/skills) and pinned in `skills-lock.json`:

- **[EnzeD/r3f-skills](https://github.com/EnzeD/r3f-skills)** (11) — R3F reference knowledge, reviewed against exactly this stack: three 0.185.1, fiber 9.7.0, drei 10.7.8, React 19.2.8.
- **[emalorenzo/three-agent-skills](https://github.com/emalorenzo/three-agent-skills)** (2) — 190+ impact-ranked rules for Three.js and R3F, framed for reviewing code as well as writing it: disposal, render loop, draw calls, zustand selectors.

Worth knowing: no agent skill exists whose actual job is auditing Three.js code for correctness and performance. These supply the rules; the review workflow has to come from elsewhere.
