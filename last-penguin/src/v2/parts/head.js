import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from '../spec.js';
import { makeBlobGeometry } from '../geometry.js';
import { MATERIALS, partMesh } from '../materials.js';

export function buildHeadPart() {
  const s = SPEC.parts.head;
  const g = new THREE.Group();
  g.name = 'part.head';
  g.add(partMesh(makeBlobGeometry(s.size, s.shape), MATERIALS.charcoal, true, 1.022));
  return g;
}

export function buildFacePart() {
  const s = SPEC.parts.face;
  const g = new THREE.Group();
  g.name = 'part.face';
  const cheekSize = [0.74, 0.78, s.size[2]];
  const left = partMesh(makeBlobGeometry(cheekSize, { belly: 0.05, bottomTaper: -0.04 }), MATERIALS.cream, false);
  const right = left.clone();
  left.position.set(-s.cheekOffsetX, s.cheekY, 0);
  right.position.set(s.cheekOffsetX, s.cheekY, 0);
  const lower = partMesh(makeBlobGeometry([0.76, 0.46, s.size[2] * 1.02], { topTaper: -0.12 }), MATERIALS.cream, false);
  lower.position.set(0, s.lowerY, 0.006);
  g.add(left, right, lower);
  return g;
}

export function buildBlushPair() {
  const g = new THREE.Group();
  const left = partMesh(makeBlobGeometry([0.22, 0.10, 0.04]), MATERIALS.blush, false);
  const right = left.clone();
  left.position.set(-0.46, -0.15, 0.095);
  right.position.set(0.46, -0.15, 0.095);
  g.add(left, right);
  return g;
}
