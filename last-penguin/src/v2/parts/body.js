import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from '../spec.js';
import { makeBlobGeometry } from '../geometry.js';
import { MATERIALS, partMesh } from '../materials.js';

export function buildBodyPart() {
  const s = SPEC.parts.body;
  const g = new THREE.Group();
  g.name = 'part.body';
  g.add(partMesh(makeBlobGeometry(s.size, s.shape), MATERIALS.charcoal, true, 1.022));
  return g;
}

export function buildBellyPart() {
  const s = SPEC.parts.belly;
  const g = new THREE.Group();
  g.name = 'part.belly';
  g.add(partMesh(makeBlobGeometry(s.size, s.shape), MATERIALS.cream, false));
  return g;
}
