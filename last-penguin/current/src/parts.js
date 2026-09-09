import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from './spec.js';
import {
  addOutline,
  enableShadows,
  makeBlobGeometry,
  makeClosedEyeGeometry,
  makeRoundedBeakGeometry,
  makeToonGradientMap,
  makeWingGeometry,
} from './geometry.js';

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

function mesh(geometry, material, outline = true, outlineFactor = 1.026) {
  const m = new THREE.Mesh(geometry, material);
  enableShadows(m);
  return outline ? addOutline(m, SPEC.colors.outline, outlineFactor) : m;
}

export function buildBodyPart() {
  const s = SPEC.parts.body;
  const group = new THREE.Group();
  group.name = 'part.body';
  group.add(mesh(makeBlobGeometry(s.size, s.shape), MATERIALS.charcoal, true, 1.022));
  return group;
}

export function buildBellyPart() {
  const s = SPEC.parts.belly;
  const group = new THREE.Group();
  group.name = 'part.belly';
  group.add(mesh(makeBlobGeometry(s.size, s.shape), MATERIALS.cream, false));
  return group;
}

export function buildHeadPart() {
  const s = SPEC.parts.head;
  const group = new THREE.Group();
  group.name = 'part.head';
  group.add(mesh(makeBlobGeometry(s.size, s.shape), MATERIALS.charcoal, true, 1.022));
  return group;
}

export function buildFacePart() {
  const s = SPEC.parts.face;
  const group = new THREE.Group();
  group.name = 'part.face';
  const cheekSize = [0.74, 0.78, s.size[2]];
  const left = mesh(makeBlobGeometry(cheekSize, { belly: 0.05, bottomTaper: -0.04 }), MATERIALS.cream, false);
  const right = left.clone();
  left.position.set(-s.cheekOffsetX, s.cheekY, 0);
  right.position.set(s.cheekOffsetX, s.cheekY, 0);
  const lower = mesh(makeBlobGeometry([0.76, 0.46, s.size[2] * 1.02], { topTaper: -0.12 }), MATERIALS.cream, false);
  lower.position.set(0, s.lowerY, 0.006);
  group.add(left, right, lower);
  return group;
}

export class EyePart extends THREE.Group {
  constructor(side) {
    super();
    this.side = side;
    this.name = side < 0 ? 'part.eyeL' : 'part.eyeR';
    const s = SPEC.parts.eye;
    this.openRig = new THREE.Group();
    this.add(this.openRig);
    this.ball = mesh(makeBlobGeometry(s.size, { belly: 0.02 }), MATERIALS.eye, false);
    this.openRig.add(this.ball);
    this.highlightA = mesh(makeBlobGeometry([0.075, 0.095, 0.045]), MATERIALS.highlight, false);
    this.highlightA.position.set(-0.055 * side, 0.095, 0.10);
    this.openRig.add(this.highlightA);
    this.highlightB = mesh(makeBlobGeometry([0.032, 0.040, 0.022]), MATERIALS.highlight, false);
    this.highlightB.position.set(0.060 * side, -0.055, 0.10);
    this.openRig.add(this.highlightB);
    this.closed = new THREE.Mesh(makeClosedEyeGeometry(0.24, 0.065, 0.024), MATERIALS.brow);
    this.closed.position.z = 0.105;
    this.closed.visible = false;
    this.add(this.closed);
    this.brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.22, 5, 8), MATERIALS.brow);
    this.brow.rotation.z = Math.PI / 2;
    this.brow.position.set(0, 0.25, 0.10);
    this.brow.visible = false;
    this.add(this.brow);
  }
  resetExpression() {
    this.openRig.visible = true;
    this.closed.visible = false;
    this.brow.visible = false;
    this.openRig.scale.set(1, 1, 1);
    this.openRig.position.set(0, 0, 0);
    this.brow.rotation.z = Math.PI / 2;
    this.brow.position.y = 0.25;
  }
  look(x, y) {
    this.openRig.position.x = THREE.MathUtils.clamp(x, -1, 1) * 0.028;
    this.openRig.position.y = THREE.MathUtils.clamp(y, -1, 1) * 0.025;
  }
}

export class BeakPart extends THREE.Group {
  constructor() {
    super();
    this.name = 'part.beak';
    const s = SPEC.parts.beak.size;
    this.mouth = mesh(makeBlobGeometry([0.25, 0.13, 0.05]), MATERIALS.mouth, false);
    this.mouth.position.set(0, -0.055, -0.02);
    this.mouth.visible = false;
    this.add(this.mouth);
    this.upper = mesh(makeRoundedBeakGeometry(s), MATERIALS.orange, true, 1.018);
    this.add(this.upper);
    this.lowerPivot = new THREE.Group();
    this.lowerPivot.position.set(0, -0.065, -0.018);
    this.lower = mesh(makeRoundedBeakGeometry([s[0] * 0.76, s[1] * 0.53, s[2] * 0.78]), MATERIALS.orangeDark, false);
    this.lowerPivot.add(this.lower);
    this.add(this.lowerPivot);
  }
  resetExpression() {
    this.mouth.visible = false;
    this.upper.scale.set(1, 1, 1);
    this.lowerPivot.rotation.x = 0;
  }
}

export function buildTuftPart() {
  const group = new THREE.Group();
  group.name = 'part.tuft';
  const a = mesh(makeWingGeometry([0.16, 0.30, 0.15]), MATERIALS.charcoalSoft, true, 1.024);
  a.rotation.z = -0.22;
  a.position.set(-0.035, 0.035, 0);
  const b = mesh(makeWingGeometry([0.13, 0.24, 0.13]), MATERIALS.charcoalSoft, true, 1.024);
  b.rotation.z = -0.62;
  b.position.set(-0.13, -0.005, -0.01);
  group.add(a, b);
  return group;
}

export function buildWingPart(side) {
  const group = new THREE.Group();
  group.name = side < 0 ? 'part.wingL' : 'part.wingR';
  const wing = mesh(makeWingGeometry(SPEC.parts.wing.size), MATERIALS.charcoalSoft, true, 1.024);
  wing.position.y = -SPEC.parts.wing.size[1] * 0.34;
  group.add(wing);
  return group;
}

export function buildFootPart(side) {
  const group = new THREE.Group();
  group.name = side < 0 ? 'part.footL' : 'part.footR';
  const [w, h, d] = SPEC.parts.foot.size;
  const palm = mesh(makeBlobGeometry([w * 0.84, h, d * 0.72], { flattenBottom: 0.18 }), MATERIALS.orange, true, 1.018);
  palm.position.z = -d * 0.03;
  group.add(palm);
  for (const [i, tx] of [-0.18, 0, 0.18].entries()) {
    const toe = mesh(makeBlobGeometry([w * 0.38, h * 0.92, d * 0.52], { flattenBottom: 0.20 }), MATERIALS.orange, false);
    toe.position.set(tx, 0.005, d * 0.22 + (i === 1 ? 0.02 : 0));
    group.add(toe);
  }
  return group;
}

export function buildScarfPart() {
  const s = SPEC.parts.scarf;
  const group = new THREE.Group();
  group.name = 'part.scarf';
  const ring = mesh(new THREE.TorusGeometry(s.majorRadius, s.tubeRadius, 14, 52), MATERIALS.scarf, true, 1.016);
  ring.rotation.x = Math.PI / 2;
  ring.scale.z = s.flattenZ;
  group.add(ring);
  const knot = mesh(makeBlobGeometry([0.28, 0.25, 0.22], { belly: 0.06 }), MATERIALS.scarfDark, true, 1.016);
  knot.position.set(0.50, -0.06, 0.49);
  group.add(knot);
  const tailPivot = new THREE.Group();
  tailPivot.name = 'scarfTailPivot';
  tailPivot.position.set(...s.tailPosition);
  const tail = mesh(makeWingGeometry(s.tailSize), MATERIALS.scarf, true, 1.016);
  tail.position.y = -s.tailSize[1] * 0.34;
  tail.rotation.z = -0.04;
  tailPivot.add(tail);
  group.add(tailPivot);
  group.userData.tailPivot = tailPivot;
  return group;
}

export function buildBlushPair() {
  const group = new THREE.Group();
  group.name = 'part.blush';
  const left = mesh(makeBlobGeometry([0.22, 0.10, 0.04]), MATERIALS.blush, false);
  const right = left.clone();
  left.position.set(-0.46, -0.15, 0.095);
  right.position.set(0.46, -0.15, 0.095);
  group.add(left, right);
  group.userData.left = left;
  group.userData.right = right;
  return group;
}
