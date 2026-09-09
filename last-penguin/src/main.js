import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PenguinCharacter } from './PenguinCharacter.js';

const container = document.querySelector('#viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeaf6ff);
scene.fog = new THREE.Fog(0xeaf6ff, 8, 18);

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 50);
camera.position.set(4.8, 3.3, 7.4);
camera.lookAt(0, 1.45, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.45, 0);
controls.enableDamping = true;
controls.minDistance = 4.2;
controls.maxDistance = 11;
controls.maxPolarAngle = Math.PI * 0.53;
controls.minPolarAngle = Math.PI * 0.18;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8bb2cb, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 3.1);
key.position.set(4.2, 7.2, 5.0);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -2;
key.shadow.bias = -0.0006;
scene.add(key);

const rim = new THREE.DirectionalLight(0xa9d8ff, 1.25);
rim.position.set(-4, 3.5, -3.5);
scene.add(rim);

const iceMat = new THREE.MeshStandardMaterial({ color: 0xd9f0ff, roughness: 0.78, metalness: 0.0 });
const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.42, 0.28, 10), iceMat);
platform.position.y = -0.17;
platform.receiveShadow = true;
scene.add(platform);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(8.5, 64),
  new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.32;
ground.receiveShadow = true;
scene.add(ground);

const penguin = new PenguinCharacter();
scene.add(penguin);

const expressionOptions = [
  ['round', 'まんまる'],
  ['sleepy', 'ねむたい'],
  ['happy', 'にっこり'],
  ['surprised', 'びっくり'],
  ['determined', '本気'],
  ['grumpy', 'むすっ'],
];
const motionOptions = [
  ['idle', '待機'],
  ['waddle', 'よちよち'],
  ['run', '走る'],
  ['slide', 'すべる'],
];

function buildButtons(rootId, options, initial, onSelect) {
  const root = document.getElementById(rootId);
  const buttons = new Map();
  for (const [value, label] of options) {
    const button = document.createElement('button');
    button.textContent = label;
    button.dataset.value = value;
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

buildButtons('expressions', expressionOptions, 'round', (value) => penguin.setExpression(value));
buildButtons('motions', motionOptions, 'idle', (value) => penguin.setMotion(value));

let lookX = 0;
let lookY = 0;
window.addEventListener('pointermove', (event) => {
  lookX = (event.clientX / innerWidth) * 2 - 1;
  lookY = -((event.clientY / innerHeight) * 2 - 1);
});

const timer = new THREE.Timer();
renderer.setAnimationLoop(() => {
  timer.update();
  const t = timer.getElapsed();
  const dt = timer.getDelta();
  penguin.setLook(lookX, lookY);
  penguin.update(t, dt);
  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
