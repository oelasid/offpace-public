import * as THREE from 'three';
import { FaceBase } from './FaceBase.js';
import { EyePart, createEyeMaterials } from './EyePart.js';
import { BrowPart } from './BrowPart.js';
import { BeakPartV2 } from './BeakPartV2.js';

export class FaceAssembly {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'FaceAssembly';

    this.faceBase = new FaceBase();
    this.eyeMaterials = createEyeMaterials();
    this.leftEye = new EyePart(this.eyeMaterials);
    this.rightEye = new EyePart(this.eyeMaterials);
    this.leftBrow = new BrowPart({ side: 'left' });
    this.rightBrow = new BrowPart({ side: 'right' });
    this.beak = new BeakPartV2();

    this.anchors = {
      leftEye: new THREE.Group(),
      rightEye: new THREE.Group(),
      leftBrow: new THREE.Group(),
      rightBrow: new THREE.Group(),
      beak: new THREE.Group(),
    };

    this.anchors.leftEye.name = 'Anchor_Eye_L';
    this.anchors.rightEye.name = 'Anchor_Eye_R';
    this.anchors.leftBrow.name = 'Anchor_Brow_L';
    this.anchors.rightBrow.name = 'Anchor_Brow_R';
    this.anchors.beak.name = 'Anchor_Beak';

    this.anchors.leftEye.add(this.leftEye.group);
    this.anchors.rightEye.add(this.rightEye.group);
    this.anchors.leftBrow.add(this.leftBrow.group);
    this.anchors.rightBrow.add(this.rightBrow.group);
    this.anchors.beak.add(this.beak.group);

    this.group.add(
      this.faceBase.group,
      this.anchors.leftEye,
      this.anchors.rightEye,
      this.anchors.leftBrow,
      this.anchors.rightBrow,
      this.anchors.beak,
    );

    this.layout = {
      eyeX: 0.245,
      eyeY: 0.065,
      eyeZ: 0.105,
      browX: 0.245,
      browY: 0.305,
      browZ: 0.120,
      eyeScale: 0.90,
      beakY: -0.105,
      beakZ: 0.178,
      beakScale: 0.72,
    };

    this.applyLayout();
    this.setExpression('neutral');
  }

  applyLayout() {
    const p = this.layout;
    this.anchors.leftEye.position.set(-p.eyeX, p.eyeY, p.eyeZ);
    this.anchors.rightEye.position.set(p.eyeX, p.eyeY, p.eyeZ);
    this.anchors.leftBrow.position.set(-p.browX, p.browY, p.browZ);
    this.anchors.rightBrow.position.set(p.browX, p.browY, p.browZ);
    this.leftEye.group.scale.setScalar(p.eyeScale);
    this.rightEye.group.scale.setScalar(p.eyeScale);
    this.anchors.beak.position.set(0,p.beakY,p.beakZ);
    this.beak.group.scale.setScalar(p.beakScale);
  }

  setEyeSpacing(v) {
    this.layout.eyeX = v / 2;
    this.layout.browX = v / 2;
    this.applyLayout();
  }

  setEyeHeight(v) {
    this.layout.eyeY = v;
    this.layout.browY = v + 0.24;
    this.applyLayout();
  }

  setExpression(name) {
    this.expression = name;
    this.leftEye.setExpression(name);
    this.rightEye.setExpression(name);
    this.beak.setExpression(name);

    const deg = THREE.MathUtils.degToRad;
    const poses = {
      neutral: { l: [0, 0, 1, 1], r: [0, 0, 1, 1] },
      sleepy: { l: [-0.018, deg(-4), 1.08, 0.75], r: [-0.018, deg(4), 1.08, 0.75] },
      happy: { l: [0.010, deg(7), 0.96, 0.84], r: [0.010, deg(-7), 0.96, 0.84] },
      determined: { l: [-0.008, deg(-13), 1.05, 0.94], r: [-0.008, deg(13), 1.05, 0.94] },
      angry: { l: [-0.018, deg(-24), 1.06, 1.0], r: [-0.018, deg(24), 1.06, 1.0] },
      surprised: { l: [0.030, deg(8), 1.12, 0.90], r: [0.030, deg(-8), 1.12, 0.90] },
    };
    const p = poses[name] || poses.neutral;
    this.leftBrow.setPose({ y: p.l[0], angle: p.l[1], scaleX: p.l[2], scaleY: p.l[3] });
    this.rightBrow.setPose({ y: p.r[0], angle: p.r[1], scaleX: p.r[2], scaleY: p.r[3] });
  }

  blinkOnce() {
    this.leftEye.blinkOnce();
    this.rightEye.blinkOnce();
  }

  setLook(x, y) {
    this.leftEye.setLook(x, y);
    this.rightEye.setLook(x, y);
  }

  setGuideVisible(v) {
    if (!this.guide) this.guide = this.createGuide();
    this.guide.visible = v;
  }

  createGuide() {
    const g = new THREE.Group();
    g.name = 'FacePlacementGuide';
    const mat = new THREE.LineBasicMaterial({ color: 0x2d5cff, transparent: true, opacity: 0.65 });
    const pts = [
      new THREE.Vector3(-0.66, this.layout.eyeY, 0.16), new THREE.Vector3(0.66, this.layout.eyeY, 0.16),
      new THREE.Vector3(0, -0.52, 0.16), new THREE.Vector3(0, 0.52, 0.16),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const lines = new THREE.LineSegments(geo, mat);
    g.add(lines);

    const markerGeo = new THREE.RingGeometry(0.025, 0.032, 24);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff8a3d, side: THREE.DoubleSide });
    for (const x of [-this.layout.eyeX, this.layout.eyeX]) {
      const m = new THREE.Mesh(markerGeo, markerMat);
      m.position.set(x, this.layout.eyeY, 0.165);
      g.add(m);
    }
    this.group.add(g);
    return g;
  }

  update(t) {
    this.leftEye.update(t);
    this.rightEye.update(t);
  }
}
