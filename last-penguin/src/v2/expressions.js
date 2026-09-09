export function applyExpression(c, name) {
  c.expression = name;
  const eyes = [c.parts.eyeL, c.parts.eyeR];
  eyes.forEach((e) => e.resetExpression());
  c.parts.beak.resetExpression();
  c.parts.blush.children.forEach((m) => { if (m.material) m.material.opacity = 0.24; });

  if (name === 'sleepy') {
    eyes.forEach((e) => { e.openRig.scale.y = 0.42; e.openRig.position.y = -0.04; e.brow.visible = true; e.brow.rotation.z = Math.PI / 2 + e.side * 0.06; e.brow.position.y = 0.17; });
    c.parts.blush.children.forEach((m) => { if (m.material) m.material.opacity = 0.13; });
  } else if (name === 'happy') {
    eyes.forEach((e) => { e.openRig.visible = false; e.closed.visible = true; });
    c.parts.beak.mouth.visible = true;
    c.parts.beak.mouth.scale.set(0.80, 1.00, 1);
    c.parts.beak.lowerPivot.rotation.x = -0.24;
    c.parts.blush.children.forEach((m) => { if (m.material) m.material.opacity = 0.36; });
  } else if (name === 'surprised') {
    eyes.forEach((e) => e.openRig.scale.set(1.18, 1.22, 1));
    c.parts.beak.mouth.visible = true;
    c.parts.beak.mouth.scale.set(0.72, 1.15, 1);
    c.parts.beak.lowerPivot.rotation.x = -0.40;
  } else if (name === 'determined') {
    eyes.forEach((e) => { e.openRig.scale.y = 0.86; e.brow.visible = true; e.brow.rotation.z = Math.PI / 2 + e.side * 0.34; e.brow.position.y = 0.22; });
  } else if (name === 'grumpy') {
    eyes.forEach((e) => { e.openRig.scale.y = 0.54; e.openRig.position.y = -0.035; e.brow.visible = true; e.brow.rotation.z = Math.PI / 2 - e.side * 0.16; e.brow.position.y = 0.18; });
    c.parts.beak.upper.scale.y = 0.88;
    c.parts.blush.children.forEach((m) => { if (m.material) m.material.opacity = 0.10; });
  } else {
    eyes.forEach((e) => e.openRig.scale.set(1.05, 1.05, 1));
  }
  c.setLook(c.lookTarget.x, c.lookTarget.y);
}

export function applyBlink(c, t) {
  if (['happy', 'sleepy'].includes(c.expression)) return;
  const phase = t % 4.2;
  const blink = phase < 0.16 ? Math.sin((phase / 0.16) * Math.PI) : 0;
  const base = c.expression === 'surprised' ? 1.22 : c.expression === 'grumpy' ? 0.54 : c.expression === 'determined' ? 0.86 : 1.05;
  const y = Math.max(0.08, base * (1 - blink * 0.88));
  c.parts.eyeL.openRig.scale.y = y;
  c.parts.eyeR.openRig.scale.y = y;
}
