import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from '../spec.js';
import { makeBlobGeometry, makeWingGeometry } from '../geometry.js';
import { MATERIALS, partMesh } from '../materials.js';

export function buildTuftPart() {
  const g = new THREE.Group();
  g.name = 'part.tuft';
  const a = partMesh(makeWingGeometry([0.16, 0.30, 0.15]), MATERIALS.charcoalSoft, true, 1.024);
  a.rotation.z = -0.22;
  a.position.set(-0.035, 0.035, 0);
  const b = partMesh(makeWingGeometry([0.13, 0.24, 0.13]), MATERIALS.charcoalSoft, true, 1.024);
  b.rotation.z = -0.62;
  b.position.set(-0.13, -0.005, -0.01);
  g.add(a, b);
  return g;
}

export function buildScarfPart() {
  const s = SPEC.parts.scarf;
  const g = new THREE.Group();
  g.name = 'part.scarf';
  const ring = partMesh(new THREE.TorusGeometry(s.majorRadius, s.tubeRadius, 14, 52), MATERIALS.scarf, true, 1.016);
  ring.rotation.x = Math.PI / 2;
  ring.scale.z = s.flattenZ;
  g.add(ring);
  const knot = partMesh(makeBlobGeometry([0.28, 0.25, 0.22], { belly: 0.06 }), MATERIALS.scarfDark, true, 1.016);
  knot.position.set(0.50, -0.06, 0.49);
  g.add(knot);
  const tailPivot = new THREE.Group();
  tailPivot.position.set(...s.tailPosition);
  const tail = partMesh(makeWingGeometry(s.tailSize), MATERIALS.scarf, true, 1.016);
  tail.position.y = -s.tailSize[1] * 0.34;
  tail.rotation.z = -0.04;
  tailPivot.add(tail);
  g.add(tailPivot);
  g.userData.tailPivot = tailPivot;
  return g;
}
