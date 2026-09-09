import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from './spec.js';
import { addOutline, enableShadows, makeToonGradientMap } from './geometry.js';

const gradientMap = makeToonGradientMap();
const toon = (color) => new THREE.MeshToonMaterial({ color, gradientMap });

export const MATERIALS = {
  charcoal: toon(SPEC.colors.charcoal),
  charcoalSoft: toon(SPEC.colors.charcoalSoft),
  cream: toon(SPEC.colors.cream),
  orange: toon(SPEC.colors.orange),
  orangeDark: toon(SPEC.colors.orangeDark),
  scarf: toon(SPEC.colors.scarf),
  scarfDark: toon(SPEC.colors.scarfDark),
  eye: new THREE.MeshPhongMaterial({ color: SPEC.colors.eye, shininess: 115, specular: 0xffffff }),
  highlight: new THREE.MeshBasicMaterial({ color: SPEC.colors.highlight }),
  blush: new THREE.MeshBasicMaterial({ color: SPEC.colors.blush, transparent: true, opacity: 0.24, depthWrite: false }),
  brow: new THREE.MeshBasicMaterial({ color: SPEC.colors.outline }),
  mouth: new THREE.MeshBasicMaterial({ color: SPEC.colors.mouth }),
};

export function partMesh(geometry, material, outline = true, outlineFactor = 1.026) {
  const m = new THREE.Mesh(geometry, material);
  enableShadows(m);
  return outline ? addOutline(m, SPEC.colors.outline, outlineFactor) : m;
}
