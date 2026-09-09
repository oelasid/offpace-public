import * as THREE from 'three';
import { PENGUIN_SPEC as SPEC } from './penguinSpec.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

function makeGradientMap() {
  const data = new Uint8Array([
    70, 70, 70, 255,
    130, 130, 130, 255,
    205, 205, 205, 255,
    255, 255, 255, 255,
  ]);
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const gradientMap = makeGradientMap();

function toon(color) {
  return new THREE.MeshToonMaterial({ color, gradientMap });
}

const materials = {
  charcoal: toon(SPEC.colors.charcoal),
  charcoalSoft: toon(SPEC.colors.charcoalSoft),
  cream: toon(SPEC.colors.cream),
  orange: toon(SPEC.colors.orange),
  orangeDark: toon(SPEC.colors.orangeDark),
  scarf: toon(SPEC.colors.scarf),
  mouth: new THREE.MeshBasicMaterial({ color: SPEC.colors.mouth }),
  eye: new THREE.MeshPhongMaterial({ color: 0x11131a, shininess: 95, specular: 0xffffff }),
  highlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  blush: new THREE.MeshBasicMaterial({ color: SPEC.colors.blush, transparent: true, opacity: 0.23, depthWrite: false }),
  brow: new THREE.MeshBasicMaterial({ color: 0x14151c }),
  outline: new THREE.MeshBasicMaterial({ color: SPEC.colors.outline, side: THREE.BackSide }),
};

function shadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addOutline(mesh, factor = 1.035) {
  const outline = new THREE.Mesh(mesh.geometry, materials.outline);
  outline.scale.setScalar(factor);
  outline.renderOrder = -1;
  mesh.add(outline);
  return mesh;
}

function ellipsoid(size, material, segments = 28) {
  const geometry = new THREE.SphereGeometry(0.5, segments, Math.max(12, Math.floor(segments * 0.7)));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(size[0], size[1], size[2]);
  return shadow(mesh);
}

function capsule(radius, length, material, capSegments = 10, radialSegments = 16) {
  return shadow(new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments),
    material,
  ));
}

function curvedLine(width = 0.035) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.12, 0, 0),
    new THREE.Vector3(0, 0.075, 0),
    new THREE.Vector3(0.12, 0, 0),
  );
  const geo = new THREE.TubeGeometry(curve, 12, width, 6, false);
  return new THREE.Mesh(geo, materials.brow);
}

class EyeRig extends THREE.Group {
  constructor(side) {
    super();
    this.side = side;
    this.baseX = side * SPEC.dimensions.eye.x;
    this.position.set(this.baseX, SPEC.dimensions.eye.y, SPEC.dimensions.eye.z);

    this.eye = new THREE.Group();
    this.add(this.eye);

    this.eyeBall = ellipsoid(SPEC.dimensions.eye.size, materials.eye, 24);
    this.eye.add(this.eyeBall);

    this.highlight = ellipsoid([0.075, 0.095, 0.045], materials.highlight, 16);
    this.highlight.position.set(-0.055 * side, 0.09, 0.07);
    this.eye.add(this.highlight);

    this.smallHighlight = ellipsoid([0.035, 0.045, 0.025], materials.highlight, 12);
    this.smallHighlight.position.set(0.055 * side, -0.055, 0.072);
    this.smallHighlight.material = this.smallHighlight.material.clone();
    this.smallHighlight.material.opacity = 0.72;
    this.smallHighlight.material.transparent = true;
    this.eye.add(this.smallHighlight);

    this.closed = curvedLine(0.027);
    this.closed.position.z = 0.065;
    this.closed.visible = false;
    this.add(this.closed);

    this.brow = capsule(0.026, 0.23, materials.brow, 4, 8);
    this.brow.rotation.z = Math.PI / 2;
    this.brow.position.set(0, 0.25, 0.065);
    this.brow.visible = false;
    this.add(this.brow);
  }

  reset() {
    this.visible = true;
    this.eye.visible = true;
    this.closed.visible = false;
    this.brow.visible = false;
    this.eye.scale.set(1, 1, 1);
    this.eye.position.set(0, 0, 0);
    this.rotation.z = 0;
    this.brow.rotation.z = Math.PI / 2;
    this.brow.position.y = 0.25;
  }

  setLook(x, y) {
    this.eye.position.x = clamp(x, -1, 1) * 0.035;
    this.eye.position.y = clamp(y, -1, 1) * 0.032;
  }
}

export class PenguinCharacter extends THREE.Group {
  constructor() {
    super();
    this.name = 'LastPenguin';
    this.expression = 'round';
    this.motion = 'idle';
    this.lookTarget = new THREE.Vector2(0, 0);
    this._build();
    this.setExpression('round');
  }

  _build() {
    this.visualRoot = new THREE.Group();
    this.add(this.visualRoot);

    const bodySpec = SPEC.dimensions.body;
    this.bodyPivot = new THREE.Group();
    this.bodyPivot.position.set(...bodySpec.position);
    this.visualRoot.add(this.bodyPivot);

    this.body = addOutline(ellipsoid(bodySpec.size, materials.charcoal, 32), 1.025);
    this.bodyPivot.add(this.body);

    this.belly = ellipsoid(SPEC.dimensions.belly.size, materials.cream, 28);
    this.belly.position.set(
      SPEC.dimensions.belly.position[0],
      SPEC.dimensions.belly.position[1] - bodySpec.position[1],
      SPEC.dimensions.belly.position[2],
    );
    this.bodyPivot.add(this.belly);

    const headSpec = SPEC.dimensions.head;
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(...headSpec.position);
    this.visualRoot.add(this.headPivot);

    this.head = addOutline(ellipsoid(headSpec.size, materials.charcoal, 32), 1.024);
    this.headPivot.add(this.head);

    for (const key of ['facePatchL', 'facePatchR']) {
      const p = SPEC.dimensions[key];
      const patch = ellipsoid(p.size, materials.cream, 28);
      patch.position.set(p.position[0], p.position[1] - headSpec.position[1], p.position[2] - headSpec.position[2]);
      this.headPivot.add(patch);
    }

    this.blushL = ellipsoid([0.22, 0.10, 0.035], materials.blush, 18);
    this.blushR = this.blushL.clone();
    this.blushL.position.set(-0.47, -0.07, 0.675);
    this.blushR.position.set(0.47, -0.07, 0.675);
    this.headPivot.add(this.blushL, this.blushR);

    this.eyeL = new EyeRig(-1);
    this.eyeR = new EyeRig(1);
    this.eyeL.position.y -= headSpec.position[1];
    this.eyeR.position.y -= headSpec.position[1];
    this.eyeL.position.z -= headSpec.position[2];
    this.eyeR.position.z -= headSpec.position[2];
    this.headPivot.add(this.eyeL, this.eyeR);

    this.beakPivot = new THREE.Group();
    this.beakPivot.position.set(0, SPEC.dimensions.beakUpper.position[1] - headSpec.position[1], SPEC.dimensions.beakUpper.position[2] - headSpec.position[2]);
    this.headPivot.add(this.beakPivot);

    this.mouth = ellipsoid([0.32, 0.20, 0.035], materials.mouth, 20);
    this.mouth.position.set(0, -0.075, -0.02);
    this.mouth.visible = false;
    this.beakPivot.add(this.mouth);

    this.beakUpper = ellipsoid(SPEC.dimensions.beakUpper.size, materials.orange, 22);
    this.beakPivot.add(this.beakUpper);

    this.beakLowerPivot = new THREE.Group();
    this.beakLowerPivot.position.set(0, -0.08, -0.015);
    this.beakPivot.add(this.beakLowerPivot);
    this.beakLower = ellipsoid(SPEC.dimensions.beakLower.size, materials.orangeDark, 20);
    this.beakLowerPivot.add(this.beakLower);

    this.tuftPivot = new THREE.Group();
    this.tuftPivot.position.set(0, 0.61, -0.02);
    this.headPivot.add(this.tuftPivot);
    const tuft1 = capsule(0.075, 0.31, materials.charcoalSoft, 6, 10);
    tuft1.rotation.z = -0.18;
    tuft1.position.set(-0.05, 0.13, 0);
    const tuft2 = capsule(0.065, 0.24, materials.charcoalSoft, 6, 10);
    tuft2.rotation.z = -0.48;
    tuft2.position.set(-0.16, 0.06, -0.01);
    this.tuftPivot.add(tuft1, tuft2);

    this.wingLPivot = new THREE.Group();
    this.wingRPivot = new THREE.Group();
    this.wingLPivot.position.set(-SPEC.dimensions.wing.pivotX, SPEC.dimensions.wing.pivotY, SPEC.dimensions.wing.z);
    this.wingRPivot.position.set(SPEC.dimensions.wing.pivotX, SPEC.dimensions.wing.pivotY, SPEC.dimensions.wing.z);
    this.visualRoot.add(this.wingLPivot, this.wingRPivot);

    const wingL = addOutline(capsule(SPEC.dimensions.wing.radius, SPEC.dimensions.wing.length, materials.charcoalSoft), 1.04);
    const wingR = addOutline(capsule(SPEC.dimensions.wing.radius, SPEC.dimensions.wing.length, materials.charcoalSoft), 1.04);
    wingL.position.y = -0.34;
    wingR.position.y = -0.34;
    this.wingLPivot.rotation.z = 0.30;
    this.wingRPivot.rotation.z = -0.30;
    this.wingLPivot.add(wingL);
    this.wingRPivot.add(wingR);

    this.footLPivot = new THREE.Group();
    this.footRPivot = new THREE.Group();
    this.footLPivot.position.set(-SPEC.dimensions.foot.x, SPEC.dimensions.foot.y, SPEC.dimensions.foot.z);
    this.footRPivot.position.set(SPEC.dimensions.foot.x, SPEC.dimensions.foot.y, SPEC.dimensions.foot.z);
    this.visualRoot.add(this.footLPivot, this.footRPivot);
    this._buildFoot(this.footLPivot, -1);
    this._buildFoot(this.footRPivot, 1);

    this.scarfPivot = new THREE.Group();
    this.scarfPivot.position.set(0, SPEC.dimensions.scarf.y, SPEC.dimensions.scarf.z);
    this.visualRoot.add(this.scarfPivot);

    const scarfRing = shadow(new THREE.Mesh(
      new THREE.TorusGeometry(SPEC.dimensions.scarf.majorRadius, SPEC.dimensions.scarf.tubeRadius, 12, 44),
      materials.scarf,
    ));
    scarfRing.rotation.x = Math.PI / 2;
    scarfRing.scale.z = 0.78;
    this.scarfPivot.add(scarfRing);

    this.scarfTailPivot = new THREE.Group();
    this.scarfTailPivot.position.set(0.48, -0.20, 0.54);
    this.scarfPivot.add(this.scarfTailPivot);
    const scarfTail = capsule(0.12, 0.55, materials.scarf, 8, 14);
    scarfTail.scale.x = 1.12;
    scarfTail.position.y = -0.26;
    this.scarfTailPivot.add(scarfTail);
  }

  _buildFoot(pivot, side) {
    const foot = addOutline(ellipsoid(SPEC.dimensions.foot.size, materials.orange, 22), 1.025);
    pivot.add(foot);
    const toeXs = [-0.18, 0, 0.18];
    for (const tx of toeXs) {
      const toe = ellipsoid([0.22, 0.10, 0.30], materials.orange, 16);
      toe.position.set(tx * (side < 0 ? 1 : 1), 0.01, 0.19);
      pivot.add(toe);
    }
  }

  setLook(x, y) {
    this.lookTarget.set(clamp(x, -1, 1), clamp(y, -1, 1));
    if (!['happy'].includes(this.expression)) {
      this.eyeL.setLook(this.lookTarget.x, this.lookTarget.y);
      this.eyeR.setLook(this.lookTarget.x, this.lookTarget.y);
    }
  }

  setExpression(name) {
    this.expression = name;
    const eyes = [this.eyeL, this.eyeR];
    eyes.forEach((e) => e.reset());
    this.blushL.material.opacity = 0.23;
    this.blushR.material.opacity = 0.23;
    this.mouth.visible = false;
    this.beakLowerPivot.rotation.x = 0;
    this.beakUpper.scale.set(1, 1, 1);

    switch (name) {
      case 'sleepy':
        eyes.forEach((e) => {
          e.eye.scale.y = 0.42;
          e.eye.position.y = -0.055;
          e.brow.visible = true;
          e.brow.rotation.z = Math.PI / 2 + e.side * 0.06;
          e.brow.position.y = 0.17;
        });
        this.blushL.material.opacity = this.blushR.material.opacity = 0.12;
        break;
      case 'happy':
        eyes.forEach((e) => {
          e.eye.visible = false;
          e.closed.visible = true;
        });
        this.mouth.visible = true;
        this.mouth.scale.set(0.75, 0.95, 1);
        this.beakLowerPivot.rotation.x = -0.22;
        this.blushL.material.opacity = this.blushR.material.opacity = 0.34;
        break;
      case 'surprised':
        eyes.forEach((e) => e.eye.scale.set(1.15, 1.2, 1));
        this.mouth.visible = true;
        this.mouth.scale.set(0.63, 1.15, 1);
        this.beakLowerPivot.rotation.x = -0.38;
        break;
      case 'determined':
        eyes.forEach((e) => {
          e.eye.scale.y = 0.88;
          e.brow.visible = true;
          e.brow.rotation.z = Math.PI / 2 + e.side * 0.36;
          e.brow.position.y = 0.22;
        });
        break;
      case 'grumpy':
        eyes.forEach((e) => {
          e.eye.scale.y = 0.55;
          e.eye.position.y = -0.045;
          e.brow.visible = true;
          e.brow.rotation.z = Math.PI / 2 - e.side * 0.16;
          e.brow.position.y = 0.18;
        });
        this.beakUpper.scale.y = 0.88;
        this.blushL.material.opacity = this.blushR.material.opacity = 0.10;
        break;
      case 'round':
      default:
        eyes.forEach((e) => e.eye.scale.set(1.06, 1.06, 1));
        break;
    }
    this.setLook(this.lookTarget.x, this.lookTarget.y);
  }

  setMotion(name) {
    this.motion = name;
  }

  update(time, dt = 1 / 60) {
    const t = time;

    this.visualRoot.position.y = 0;
    this.visualRoot.rotation.set(0, 0, 0);
    this.bodyPivot.rotation.set(0, 0, 0);
    this.headPivot.rotation.set(0, 0, 0);
    this.wingLPivot.rotation.x = 0;
    this.wingRPivot.rotation.x = 0;
    this.footLPivot.rotation.x = 0;
    this.footRPivot.rotation.x = 0;
    this.scarfTailPivot.rotation.z = 0;

    if (this.motion === 'idle') {
      this.visualRoot.position.y = Math.sin(t * 2.15) * 0.025;
      this.bodyPivot.rotation.z = Math.sin(t * 1.15) * 0.015;
      this.headPivot.rotation.z = -Math.sin(t * 1.15) * 0.018;
      this.wingLPivot.rotation.z = 0.30 + Math.sin(t * 1.8) * 0.035;
      this.wingRPivot.rotation.z = -0.30 - Math.sin(t * 1.8) * 0.035;
      this.scarfTailPivot.rotation.z = Math.sin(t * 2.1) * 0.045;
    }

    if (this.motion === 'waddle') {
      const s = Math.sin(t * 7.0);
      this.visualRoot.rotation.z = s * 0.105;
      this.visualRoot.position.y = Math.abs(Math.sin(t * 7.0)) * 0.055;
      this.footLPivot.rotation.x = Math.sin(t * 7.0) * 0.48;
      this.footRPivot.rotation.x = -Math.sin(t * 7.0) * 0.48;
      this.wingLPivot.rotation.z = 0.46 + s * 0.10;
      this.wingRPivot.rotation.z = -0.46 + s * 0.10;
      this.headPivot.rotation.z = -s * 0.055;
      this.scarfTailPivot.rotation.z = -s * 0.14;
    }

    if (this.motion === 'run') {
      const s = Math.sin(t * 10.5);
      this.visualRoot.position.y = Math.abs(Math.sin(t * 10.5)) * 0.085;
      this.visualRoot.rotation.z = s * 0.055;
      this.footLPivot.rotation.x = s * 0.82;
      this.footRPivot.rotation.x = -s * 0.82;
      this.wingLPivot.rotation.z = 0.64 + s * 0.17;
      this.wingRPivot.rotation.z = -0.64 + s * 0.17;
      this.headPivot.rotation.x = Math.sin(t * 21.0) * 0.025;
      this.scarfTailPivot.rotation.z = -0.36 + Math.sin(t * 8.0) * 0.09;
    }

    if (this.motion === 'slide') {
      this.visualRoot.rotation.x = -0.60;
      this.visualRoot.position.y = -0.04 + Math.sin(t * 6) * 0.012;
      this.wingLPivot.rotation.z = 1.02;
      this.wingRPivot.rotation.z = -1.02;
      this.footLPivot.rotation.x = -0.35;
      this.footRPivot.rotation.x = -0.35;
      this.scarfTailPivot.rotation.z = -0.60 + Math.sin(t * 7) * 0.08;
    }

    if (!['happy', 'sleepy'].includes(this.expression)) {
      const phase = t % 4.2;
      let blink = 0;
      if (phase < 0.16) blink = Math.sin((phase / 0.16) * Math.PI);
      const baseScale = this.expression === 'surprised' ? 1.2 : this.expression === 'grumpy' ? 0.55 : this.expression === 'determined' ? 0.88 : 1.06;
      const yScale = baseScale * (1 - blink * 0.88);
      this.eyeL.eye.scale.y = Math.max(0.08, yScale);
      this.eyeR.eye.scale.y = Math.max(0.08, yScale);
    }
  }
}
