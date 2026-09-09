import * as THREE from 'three';

function toonRamp() {
  const data = new Uint8Array([48, 112, 190, 255]);
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function makeFaceShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.52);
  s.bezierCurveTo(-0.10, 0.48, -0.16, 0.43, -0.22, 0.37);
  s.bezierCurveTo(-0.38, 0.48, -0.60, 0.40, -0.65, 0.14);
  s.bezierCurveTo(-0.70, -0.12, -0.56, -0.40, -0.33, -0.49);
  s.bezierCurveTo(-0.18, -0.55, -0.08, -0.50, 0, -0.43);
  s.bezierCurveTo(0.08, -0.50, 0.18, -0.55, 0.33, -0.49);
  s.bezierCurveTo(0.56, -0.40, 0.70, -0.12, 0.65, 0.14);
  s.bezierCurveTo(0.60, 0.40, 0.38, 0.48, 0.22, 0.37);
  s.bezierCurveTo(0.16, 0.43, 0.10, 0.48, 0, 0.52);
  return s;
}

export class FaceBase {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'FaceBase';
    const material = new THREE.MeshToonMaterial({ color: 0xf8f7f1, gradientMap: toonRamp(), roughness: 0.8 });
    const geometry = new THREE.ExtrudeGeometry(makeFaceShape(), {
      depth: 0.16, steps: 1, bevelEnabled: true, bevelSegments: 5,
      bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 32,
    });
    geometry.center();
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = 'FaceShell';
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.z = -0.02;
    this.group.add(this.mesh);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xffb3c1, transparent: true, opacity: 0.45, depthWrite: false });
    this.cheekL = new THREE.Mesh(new THREE.CircleGeometry(0.10, 36), blushMat);
    this.cheekR = this.cheekL.clone();
    this.cheekL.position.set(-0.43, -0.18, 0.103);
    this.cheekR.position.set(0.43, -0.18, 0.103);
    this.cheekL.scale.set(1.12, 0.62, 1);
    this.cheekR.scale.copy(this.cheekL.scale);
    this.group.add(this.cheekL, this.cheekR);
  }
}
