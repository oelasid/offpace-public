import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from './spec.js';

const setPos = (o, p) => o.position.set(p[0], p[1], p[2]);
const sum = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const off = (c, name) => c.exploded ? (SPEC.assembly.explodedOffsets[name] ?? [0, 0, 0]) : [0, 0, 0];

export function assembleCharacter(c) {
  c.visualRoot = new THREE.Group();
  c.add(c.visualRoot);
  c.bodyPivot = new THREE.Group();
  c.headPivot = new THREE.Group();
  c.wingLPivot = new THREE.Group();
  c.wingRPivot = new THREE.Group();
  c.footLPivot = new THREE.Group();
  c.footRPivot = new THREE.Group();
  c.scarfPivot = new THREE.Group();
  c.visualRoot.add(c.bodyPivot, c.headPivot, c.wingLPivot, c.wingRPivot, c.footLPivot, c.footRPivot, c.scarfPivot);
  c.bodyPivot.add(c.parts.body, c.parts.belly);
  c.headPivot.add(c.parts.head, c.parts.face, c.parts.eyeL, c.parts.eyeR, c.parts.beak, c.parts.tuft, c.parts.blush);
  c.wingLPivot.add(c.parts.wingL);
  c.wingRPivot.add(c.parts.wingR);
  c.footLPivot.add(c.parts.footL);
  c.footRPivot.add(c.parts.footR);
  c.scarfPivot.add(c.parts.scarf);
  applyAssemblyPositions(c);
}

export function applyAssemblyPositions(c) {
  const p = SPEC.parts;
  setPos(c.bodyPivot, p.body.position);
  setPos(c.parts.body, off(c, 'body'));
  setPos(c.parts.belly, sum([p.belly.position[0]-p.body.position[0], p.belly.position[1]-p.body.position[1], p.belly.position[2]-p.body.position[2]], off(c, 'belly')));

  setPos(c.headPivot, p.head.position);
  setPos(c.parts.head, off(c, 'head'));
  setPos(c.parts.face, sum([p.face.position[0]-p.head.position[0], p.face.position[1]-p.head.position[1], p.face.position[2]-p.head.position[2]], off(c, 'face')));
  setPos(c.parts.eyeL, sum([-p.eye.x-p.head.position[0], p.eye.y-p.head.position[1], p.eye.z-p.head.position[2]], off(c, 'eyeL')));
  setPos(c.parts.eyeR, sum([p.eye.x-p.head.position[0], p.eye.y-p.head.position[1], p.eye.z-p.head.position[2]], off(c, 'eyeR')));
  setPos(c.parts.beak, sum([p.beak.position[0]-p.head.position[0], p.beak.position[1]-p.head.position[1], p.beak.position[2]-p.head.position[2]], off(c, 'beak')));
  setPos(c.parts.tuft, sum([p.tuft.position[0]-p.head.position[0], p.tuft.position[1]-p.head.position[1], p.tuft.position[2]-p.head.position[2]], off(c, 'tuft')));
  c.parts.blush.position.set(0, 0, 0.01);

  setPos(c.wingLPivot, sum(p.wing.pivotLeft, off(c, 'wingL')));
  setPos(c.wingRPivot, sum(p.wing.pivotRight, off(c, 'wingR')));
  c.wingLPivot.rotation.z = p.wing.baseRotationZ;
  c.wingRPivot.rotation.z = -p.wing.baseRotationZ;
  setPos(c.footLPivot, sum([-p.foot.x, p.foot.y, p.foot.z], off(c, 'footL')));
  setPos(c.footRPivot, sum([p.foot.x, p.foot.y, p.foot.z], off(c, 'footR')));
  setPos(c.scarfPivot, sum(p.scarf.position, off(c, 'scarf')));
}
