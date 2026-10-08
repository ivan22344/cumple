import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const sceneElement = document.querySelector("#scene");
const sceneWrap = document.querySelector("#sceneWrap");
const openButton = document.querySelector("#openGift");
const message = document.querySelector("#message");
const confettiLayer = document.querySelector("#confetti");
const musicPlayer = document.querySelector("#musicPlayer");
const surpriseButton = document.querySelector("#surpriseButton");
const surpriseMessage = document.querySelector("#surpriseMessage");
const letterText = document.querySelector("#letterText");
const petalsLayer = document.querySelector("#petals");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
camera.position.set(0, 1.2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
sceneElement.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xbad8ff, 0x17233e, 2.4));
const keyLight = new THREE.DirectionalLight(0xffd9c7, 4);
keyLight.position.set(-3, 5, 4);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xf18ba4, 22, 9);
rimLight.position.set(3, 1, 2);
scene.add(rimLight);

const gift = new THREE.Group();
gift.rotation.y = -.25;
gift.visible = false;
scene.add(gift);

const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xf18ba4, roughness: .33, metalness: .05 });
const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xffe7a7, roughness: .3, metalness: .15 });
const box = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.65, 2.25), boxMaterial);
box.position.y = .9;
gift.add(box);

const ribbonVertical = new THREE.Mesh(new THREE.BoxGeometry(.38, 1.7, 2.29), ribbonMaterial);
ribbonVertical.position.y = .93;
gift.add(ribbonVertical);
const ribbonHorizontal = new THREE.Mesh(new THREE.BoxGeometry(2.72, .28, 2.27), ribbonMaterial);
ribbonHorizontal.position.y = 1.35;
gift.add(ribbonHorizontal);

const lidPivot = new THREE.Group();
lidPivot.position.set(0, 1.72, -1.08);
gift.add(lidPivot);
const lid = new THREE.Mesh(new THREE.BoxGeometry(2.95, .4, 2.4), boxMaterial);
lid.position.set(0, .2, 1.08);
lidPivot.add(lid);
const lidRibbon = new THREE.Mesh(new THREE.BoxGeometry(.4, .42, 2.42), ribbonMaterial);
lidRibbon.position.set(0, .2, 1.08);
lidPivot.add(lidRibbon);

const tulip = new THREE.Group();
tulip.position.set(0, 0, .25);
tulip.visible = false;
gift.add(tulip);

const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x5fa879, roughness: .8 });
const stem = new THREE.Mesh(new THREE.CylinderGeometry(.075, .1, 1.35, 12), stemMaterial);
stem.position.set(0, 1.98, 0);
tulip.add(stem);

const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), stemMaterial);
leaf.scale.set(.12, .48, .05);
leaf.rotation.z = -.65;
leaf.position.set(-.2, 1.86, 0);
tulip.add(leaf);

const petalMaterial = new THREE.MeshStandardMaterial({
  color: 0xff88a8,
  roughness: .28,
  emissive: 0x3b071b,
  emissiveIntensity: .22,
});
const petalLightMaterial = new THREE.MeshStandardMaterial({ color: 0xffb5c8, roughness: .3 });
const flower = new THREE.Group();
flower.position.set(0, 2.48, 0);
tulip.add(flower);

function createTulipPetal(material) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -.46);
  shape.bezierCurveTo(-.34, -.28, -.48, .22, -.38, .54);
  shape.bezierCurveTo(-.3, .78, -.1, .72, 0, .56);
  shape.bezierCurveTo(.1, .72, .3, .78, .38, .54);
  shape.bezierCurveTo(.48, .22, .34, -.28, 0, -.46);
  return new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: .16,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: .035,
      bevelThickness: .035,
    }),
    material,
  );
}

const petalPositions = [
  [-.3, .02, .12, -.24, petalMaterial, .9],
  [.3, .02, .12, .24, petalMaterial, .9],
  [0, .1, .2, 0, petalLightMaterial, 1.02],
  [-.12, .04, .28, -.08, petalLightMaterial, .95],
  [.12, .04, .28, .08, petalMaterial, .95],
];
petalPositions.forEach(([x, y, z, rotation, material, scale]) => {
  const petal = createTulipPetal(material);
  petal.position.set(x, y, z);
  petal.rotation.z = rotation;
  petal.scale.set(scale, scale, scale);
  flower.add(petal);
});

const particles = new THREE.Group();
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffd98e });
for (let i = 0; i < 24; i += 1) {
  const particle = new THREE.Mesh(new THREE.SphereGeometry(.035 + Math.random() * .04, 8, 8), particleMaterial);
  particle.position.set((Math.random() - .5) * 5, Math.random() * 3, (Math.random() - .5) * 2);
  particle.userData.phase = Math.random() * Math.PI * 2;
  particles.add(particle);
}
scene.add(particles);

let opened = false;
let targetLidRotation = 0;
let targetCameraZ = 8;
let targetCameraY = 1.2;

function resize() {
  const width = sceneElement.clientWidth;
  const height = sceneElement.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function makeConfetti() {
  const symbols = ["♥", "✚", "✦", "●"];
  const colors = ["#ff8fa8", "#f5c978", "#9ed3ff", "#ffffff"];
  for (let i = 0; i < 65; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = symbols[i % symbols.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.color = colors[i % colors.length];
    piece.style.fontSize = `${12 + Math.random() * 18}px`;
    piece.style.setProperty("--duration", `${2.3 + Math.random() * 2.5}s`);
    piece.style.setProperty("--drift", `${-130 + Math.random() * 260}px`);
    piece.style.animationDelay = `${Math.random() * .55}s`;
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 5200);
  }
}

function makePetals() {
  for (let i = 0; i < 30; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = i % 2 ? "❀" : "♥";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--duration", `${3 + Math.random() * 3}s`);
    petal.style.setProperty("--drift", `${-160 + Math.random() * 320}px`);
    petal.style.animationDelay = `${Math.random() * 1.2}s`;
    petalsLayer.appendChild(petal);
    window.setTimeout(() => petal.remove(), 7200);
  }
}

function typeLetter() {
  const text = letterText.textContent.replace(/\s+/g, " ").trim();
  letterText.textContent = "";
  let index = 0;
  const write = () => {
    letterText.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) window.setTimeout(write, 65);
  };
  write();
}

function openGift() {
  if (opened) return;
  opened = true;
  targetLidRotation = -.95;
  targetCameraZ = 7.35;
  targetCameraY = 1.22;
  sceneWrap.classList.add("opened");
  openButton.innerHTML = "Disfruta tu día <span class=\"button-heart\">♥</span>";
  openButton.disabled = true;
  message.hidden = false;
  makeConfetti();
  makePetals();
  typeLetter();
  musicPlayer.currentTime = 0;
  musicPlayer.play().catch(() => {});
  message.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showSurprise() {
  surpriseMessage.hidden = false;
  surpriseButton.textContent = "Que nunca dejes de brillar ♥";
  surpriseButton.disabled = true;
  makeConfetti();
  makePetals();
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  const seconds = time * .001;
  gift.rotation.y = -.25 + Math.sin(seconds * .55) * .12;
  tulip.rotation.z = Math.sin(seconds * .9) * .035;
  flower.rotation.y = Math.sin(seconds * .8) * .08;
  lidPivot.rotation.x += (targetLidRotation - lidPivot.rotation.x) * .06;
  camera.position.z += (targetCameraZ - camera.position.z) * .035;
  camera.position.y += (targetCameraY - camera.position.y) * .035;
  particles.rotation.y = seconds * .08;
  particles.children.forEach((particle) => {
    particle.position.y += Math.sin(seconds * .7 + particle.userData.phase) * .0008;
  });
  renderer.render(scene, camera);
}

window.addEventListener("resize", resize);
openButton.addEventListener("click", openGift);
sceneElement.addEventListener("click", openGift);
surpriseButton.addEventListener("click", showSurprise);
resize();
animate();
