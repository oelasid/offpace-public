import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from '../spec.js';
import { makeBlobGeometry, makeRoundedBeakGeometry } from '../geometry.js';
import { MATERIALS, partMesh } from '../materials.js';

export class BeakPart extends THREE.Group {
  constructor() {
    super();
    this.name = 'part.beak';
    const s = SPEC.parts.beak.size;
    this.mouth = partMesh(makeBlobGeometry([0.25, 0.13, 0.05]), MATERIALS.mouth, false);
    this.mouth.position.set(0, -0.055, -0.02);
    this.mouth.visible = false;
    this.add(this.mouth);
    this.upper = partMesh(makeRoundedBeakGeometry(s), MATERIALS.orange, true, 1.018);
    this.add(this.upper);
    this.lowerPivot = new THREE.Group();
    this.lowerPivot.position.set(0, -0.065, -0.018);
    this.lower = partMesh(makeRoundedBeakGeometry([s[0] * 0.76, s[1] * 0.53, s[2] * 0.78]), MATERIALS.orangeDark, false);
    this.lowerPivot.add(this.lower);
    this.add(this.lowerPivot);
  }

  resetExpression() {
    this.mouth.visible = false;
    this.upper.scale.set(1, 1, 1);
    this.lowerPivot.rotation.x = 0;
  }
}
