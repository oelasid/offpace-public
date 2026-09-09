import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from '../spec.js';
import { makeBlobGeometry, makeClosedEyeGeometry } from '../geometry.js';
import { MATERIALS, partMesh } from '../materials.js';

export class EyePart extends THREE.Group {
  constructor(side) {
    super();
    this.side = side;
    this.name = side < 0 ? 'part.eyeL' : 'part.eyeR';
    const s = SPEC.parts.eye;
    this.openRig = new THREE.Group();
    this.add(this.openRig);
    this.ball = partMesh(makeBlobGeometry(s.size, { belly: 0.02 }), MATERIALS.eye, false);
    this.openRig.add(this.ball);
    const hiA = partMesh(makeBlobGeometry([0.075, 0.095, 0.045]), MATERIALS.highlight, false);
    hiA.position.set(-0.055 * side, 0.095, 0.10);
    const hiB = partMesh(makeBlobGeometry([0.032, 0.040, 0.022]), MATERIALS.highlight, false);
    hiB.position.set(0.060 * side, -0.055, 0.10);
    this.openRig.add(hiA, hiB);
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
