import { PENGUIN_V2_SPEC as SPEC } from './spec.js';

export function applyMotion(c, t) {
  const wingBase = SPEC.parts.wing.baseRotationZ;
  c.visualRoot.position.y = 0;
  c.visualRoot.rotation.set(0, 0, 0);
  c.bodyPivot.rotation.set(0, 0, 0);
  c.headPivot.rotation.set(0, 0, 0);
  c.wingLPivot.rotation.x = 0;
  c.wingRPivot.rotation.x = 0;
  c.wingLPivot.rotation.z = wingBase;
  c.wingRPivot.rotation.z = -wingBase;
  c.footLPivot.rotation.x = 0;
  c.footRPivot.rotation.x = 0;
  const tail = c.parts.scarf.userData.tailPivot;
  tail.rotation.z = 0;

  if (c.motion === 'idle') {
    c.visualRoot.position.y = Math.sin(t * 2.0) * 0.018;
    c.bodyPivot.rotation.z = Math.sin(t * 1.1) * 0.012;
    c.headPivot.rotation.z = -Math.sin(t * 1.1) * 0.014;
    c.wingLPivot.rotation.z = wingBase + Math.sin(t * 1.7) * 0.025;
    c.wingRPivot.rotation.z = -wingBase - Math.sin(t * 1.7) * 0.025;
    tail.rotation.z = Math.sin(t * 2.0) * 0.05;
  } else if (c.motion === 'waddle') {
    const s = Math.sin(t * 7.0);
    c.visualRoot.rotation.z = s * 0.10;
    c.visualRoot.position.y = Math.abs(s) * 0.045;
    c.footLPivot.rotation.x = s * 0.45;
    c.footRPivot.rotation.x = -s * 0.45;
    c.wingLPivot.rotation.z = 0.43 + s * 0.09;
    c.wingRPivot.rotation.z = -0.43 + s * 0.09;
    c.headPivot.rotation.z = -s * 0.05;
    tail.rotation.z = -s * 0.12;
  } else if (c.motion === 'run') {
    const s = Math.sin(t * 10.6);
    c.visualRoot.position.y = Math.abs(s) * 0.07;
    c.visualRoot.rotation.z = s * 0.045;
    c.footLPivot.rotation.x = s * 0.78;
    c.footRPivot.rotation.x = -s * 0.78;
    c.wingLPivot.rotation.z = 0.62 + s * 0.16;
    c.wingRPivot.rotation.z = -0.62 + s * 0.16;
    c.headPivot.rotation.x = Math.sin(t * 21.2) * 0.02;
    tail.rotation.z = -0.34 + Math.sin(t * 8.0) * 0.08;
  } else if (c.motion === 'slide') {
    c.visualRoot.rotation.x = -0.55;
    c.visualRoot.position.y = -0.03 + Math.sin(t * 6.0) * 0.01;
    c.wingLPivot.rotation.z = 0.98;
    c.wingRPivot.rotation.z = -0.98;
    c.footLPivot.rotation.x = -0.32;
    c.footRPivot.rotation.x = -0.32;
    tail.rotation.z = -0.55 + Math.sin(t * 7.0) * 0.07;
  }
}
