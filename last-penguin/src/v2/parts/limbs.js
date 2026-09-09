import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from '../spec.js';
import { makeBlobGeometry, makeWingGeometry } from '../geometry.js';
import { MATERIALS, partMesh } from '../materials.js';

export function buildWingPart(side) {
  const g = new THREE.Group();
  g.name = side < 0 ? 'part.wingL' : 'part.wingR';
  const wing = partMesh(makeWingGeometry(SPEC.parts.wing.size), MATERIALS.charcoalSoft, true, 1.024);
  wing.position.y = -SPEC.parts.wing.size[1] * 0.34;
  g.add(wing);
  return g;
}

export function buildFootPart(side) {
  const g = new THREE.Group();
  g.name = side < 0 ? 'part.footL' : 'part.footR';
  const [w, h, d] = SPEC.parts.foot.size;
  const palm = partMesh(makeBlobGeometry([w * 0.84, h, d * 0.72], { flattenBottom: 0.18 }), MATERIALS.orange, true, 1.018);
  palm.position.z = -d * 0.03;
  g.add(palm);
  [-0.18, 0, 0.18].forEach((tx, i) => {
    const toe = partMesh(makeBlobGeometry([w * 0.38, h * 0.92, d * 0.52], { flattenBottom: 0.20 }), MATERIALS.orange, false);
    toe.position.set(tx, 0.005, d * 0.22 + (i === 1 ? 0.02 : 0));
    g.add(toe);
  });
  return g;
}
