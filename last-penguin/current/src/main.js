import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LastPenguinCurrent } from './LastPenguinCurrent.js';

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeaf3ff);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
camera.position.set(3.35, 2.35, 5.9);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.05, 0.15);

scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c9e6, 2));
const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(4, 7, 5);
key.castShadow = true;
scene.add(key);

const floor = new THREE.Mesh(
  new THREE.CylinderGeometry(1.55, 1.75, 0.16, 64),
  new THREE.MeshStandardMaterial({ color: 0xf8fcff, roughness: 0.8 })
);
floor.position.y = -0.07;
floor.receiveShadow = true;
scene.add(floor);

const penguin = new LastPenguinCurrent();
scene.add(penguin);

document.getElementById('expression').addEventListener('change', e => penguin.setExpression(e.target.value));
document.getElementById('motion').addEventListener('change', e => penguin.setMotion(e.target.value));
document.getElementById('guide').addEventListener('change', e => penguin.setGuideVisible(e.target.checked));
document.getElementById('blink').addEventListener('click', () => penguin.blink());

function resize() {
  const w = app.clientWidth;
  const h = app.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', resize);
resize();

function animate(t) {
  requestAnimationFrame(animate);
  penguin.update(t);
  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
