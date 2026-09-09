import * as THREE from 'three';
import { buildBodyPart, buildBellyPart } from './parts/body.js';
import { buildHeadPart, buildFacePart, buildBlushPair } from './parts/head.js';
import { EyePart } from './parts/eye.js';
import { BeakPart } from './parts/beak.js';
import { buildWingPart, buildFootPart } from './parts/limbs.js';
import { buildTuftPart, buildScarfPart } from './parts/accessories.js';
import { assembleCharacter, applyAssemblyPositions } from './assembly.js';
import { applyExpression, applyBlink } from './expressions.js';
import { applyMotion } from './motion.js';

const clamp = THREE.MathUtils.clamp;

export class PenguinCharacterV2 extends THREE.Group {
  constructor() {
    super();
    this.name = 'LastPenguinV2';
    this.expression = 'round';
    this.motion = 'idle';
    this.exploded = false;
    this.wireframe = false;
    this.lookTarget = new THREE.Vector2(0, 0);
    this.parts = {
      body: buildBodyPart(), belly: buildBellyPart(), head: buildHeadPart(), face: buildFacePart(),
      eyeL: new EyePart(-1), eyeR: new EyePart(1), beak: new BeakPart(), tuft: buildTuftPart(),
      wingL: buildWingPart(-1), wingR: buildWingPart(1), footL: buildFootPart(-1), footR: buildFootPart(1),
      scarf: buildScarfPart(), blush: buildBlushPair(),
    };
    assembleCharacter(this);
    this.setExpression('round');
  }

  setExploded(enabled) {
    this.exploded = Boolean(enabled);
    applyAssemblyPositions(this);
  }

  setWireframe(enabled) {
    this.wireframe = Boolean(enabled);
    this.traverse((child) => {
      if (!child.isMesh || !child.material || !('wireframe' in child.material)) return;
      if (child.material.side !== THREE.BackSide) child.material.wireframe = this.wireframe;
    });
  }

  setLook(x, y) {
    this.lookTarget.set(clamp(x, -1, 1), clamp(y, -1, 1));
    if (this.expression !== 'happy') {
      this.parts.eyeL.look(this.lookTarget.x, this.lookTarget.y);
      this.parts.eyeR.look(this.lookTarget.x, this.lookTarget.y);
    }
  }

  setExpression(name) { applyExpression(this, name); }
  setMotion(name) { this.motion = name; }

  update(t) {
    applyAssemblyPositions(this);
    applyMotion(this, t);
    applyBlink(this, t);
  }
}
