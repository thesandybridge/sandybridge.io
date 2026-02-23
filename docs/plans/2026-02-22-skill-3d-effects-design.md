# Skill 3D Effects Design

## Summary

When a user clicks a tech skill badge on the homepage, abstract 3D geometry particles burst into the existing R3F background scene, themed to each skill. Existing background shapes get a subtle color tint/push. Rapidly clicking a skill 5 times within 2 seconds triggers a dramatic "wow" moment with bloom and chromatic aberration post-processing. Disabled on mobile.

## Communication Layer

- `SkillEffectContext` provides `triggerSkillEffect(skillId, screenPosition)`
- TechStack badges call this on click with their bounding rect center as normalized coords
- Background subscribes and spawns particles accordingly
- Click counter per skill tracks timestamps within a 2s window; 5 clicks = wow

## Particle System

Each skill has an effect config:

```ts
interface SkillEffectConfig {
  skillId: string
  color: string           // brand color
  geometry: string        // abstract geometry type
  count: { normal: number; wow: number }
  movement: string        // movement pattern function name
  wowEffect: string       // wow payoff function name
}
```

### Per-Skill Effects

| Skill | Geometry | Movement | Wow Payoff |
|-------|----------|----------|------------|
| TypeScript | Crystalline prisms | Refract/split outward | Prisms align into crystal lattice then shatter |
| React | Tori/rings | Orbit center point | Rings nest into gyroscope, spin up, burst |
| Next.js | Triangular shards | Swirl in vortex | Vortex tightens to singularity then shockwave |
| Rust | Angular fragments | Fragment outward | Shards converge, compress, violently explode |
| Go | Icosahedrons | Float upward | Merge into sphere that pulses and dissolves |
| Node.js | Connected line segments | Branch like network | Network fills viewport then collapses |
| PostgreSQL | Hexagonal columns | Stack/tile outward | Columns build tower that crumbles |
| Redis | Diamond octahedrons | Pulse in waves | Form grid, flash in sequence, scatter |
| Docker | Cube clusters | Drift apart in groups | Snap into container wall then break |
| Neovim | Thin rectangular bars | Cascade like text | Matrix rain then dissolve |
| tmux | Flat planes | Split and tile | Recursively subdivide viewport then fold |
| Arch Linux | Tetrahedrons | Rise in formation | Form arch shape, pulse, rain down |

### Implementation

- `InstancedMesh` per geometry type for performance
- Particles spawn at skill's screen position projected into 3D space
- Animate for ~2 seconds, fade out via opacity lerp
- Background shapes: brief color tint toward skill brand color (lerp 0.3s in, 1s out) + subtle outward push from click origin

## Post-Processing (Wow Only)

Only activates on 5-click wow moment. Uses `@react-three/postprocessing` EffectComposer:

- **Bloom**: intensity 0 -> 1.5 over 0.5s during convergence, fade to 0 over 1s after burst
- **ChromaticAberration**: brief burst (0 -> strong -> 0 over 0.3s) timed with explosion

EffectComposer only mounts when wow is active, unmounts after. Zero cost during normal browsing.

## Click Tracking

- Per-skill timestamp array
- On click: push `Date.now()`, filter timestamps older than 2s
- 5 timestamps remaining = trigger wow, clear array, 3s cooldown
- Normal clicks debounced at 150ms (faster clicks only count toward wow threshold)

## Mobile

No changes needed. `useIsMobile()` already disables the R3F Canvas. `triggerSkillEffect` is a no-op when no Canvas exists.

## Dependencies

- `@react-three/postprocessing` (new)
- `postprocessing` (peer dep of above)
