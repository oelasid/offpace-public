import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PenguinCharacterV2 } from './v2/PenguinCharacterV2.js';

const container = document.querySelector('#viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeaf6ff);
scene.fog = new THREE.Fog(0xeaf6ff, 8, 18);

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 50);
camera.position.set(4.4, 2.8, 6.5);
camera.lookAt(0, 1.02, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.02, 0);
controls.enableDamping = true;
controls.minDistance = 3.6;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI * 0.56;
controls.minPolarAngle = Math.PI * 0.16;

scene.add(new THREE.HemisphereLight(0xffffff, 0x91b5cd, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 3.0);
key.position.set(4.2, 7.0, 5.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -2;
key.shadow.bias = -0.0006;
scene.add(key);
const rim = new THREE.DirectionalLight(0xb7dcff, 1.15);
rim.position.set(-4, 3.6, -3.5);
scene.add(rim);

const ice = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.28, 0.24, 12), new THREE.MeshStandardMaterial({ color: 0xd9f0ff, roughness: 0.76 }));
ice.position.y = -0.13;
ice.receiveShadow = true;
scene.add(ice);
const ground = new THREE.Mesh(new THREE.CircleGeometry(8.0, 64), new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.27;
ground.receiveShadow = true;
scene.add(ground);

const penguin = new PenguinCharacterV2();
scene.add(penguin);

const expressionOptions = [['round','まんまる'],['sleepy','ねむたい'],['happy','にっこり'],['surprised','びっくり'],['determined','本気'],['grumpy','むすっ']];
const motionOptions = [['idle','待機'],['waddle','よちよち'],['run','走る'],['slide','すべる']];

function buildButtons(rootId, options, initial, onSelect) {
  const root = document.getElementById(rootId);
  const buttons = new Map();
  for (const [value, label] of options) {
    const button = document.createElement('button');
    button.textContent = label;
    if (value === initial) button.classList.add('active');
    button.addEventListener('click', () => {
      for (const b of buttons.values()) b.classList.remove('active');
      button.classList.add('active');
      onSelect(value);
    });
    root.appendChild(button);
    buttons.set(value, button);
  }
}
function bindToggle(id, onChange) {
  const button = document.getElementById(id);
  let enabled = false;
  button.addEventListener('click', () => {
    enabled = !enabled;
    button.classList.toggle('active', enabled);
    button.setAttribute('aria-pressed', String(enabled));
    onChange(enabled);
  });
}

buildButtons('expressions', expressionOptions, 'round', (v) => penguin.setExpression(v));
buildButtons('motions', motionOptions, 'idle', (v) => penguin.setMotion(v));
bindToggle('explode', (v) => penguin.setExploded(v));
bindToggle('wireframe', (v) => penguin.setWireframe(v));

let lookX = 0, lookY = 0;
window.addEventListener('pointermove', (event) => {
  lookX = (event.clientX / innerWidth) * 2 - 1;
  lookY = -((event.clientY / innerHeight) * 2 - 1);
});

const timer = new THREE.Timer();
renderer.setAnimationLoop(() => {
  timer.update();
  const t = timer.getElapsed();
  penguin.setLook(lookX, lookY);
  penguin.update(t);
  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
