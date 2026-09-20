/* Textured Mark 85 model; attribution travels with the offline GLB in models/ironman. */
import * as THREE from '../vendor/three/three.module.min.js';
import { GLTFLoader } from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from '../vendor/three/examples/jsm/environments/RoomEnvironment.js';

function createDanceRig(model, group) {
  const bones = {};
  group.updateMatrixWorld(true);
  model.traverse(node => {
    const name = node.name.match(/(Hips|Spine2|Head|LeftArm|RightArm|LeftForeArm|RightForeArm|LeftUpLeg|RightUpLeg|LeftLeg|RightLeg|LeftFoot|RightFoot|LeftToeBase|RightToeBase|(?:Left|Right)Hand(?:(?:Thumb|Index|Middle|Ring|Pinky)[123])?)(?:_\d+)?$/)?.[1];
    if (node.isBone && name) {
      const world = node.getWorldQuaternion(new THREE.Quaternion());
      bones[name] = { node, rotation: node.quaternion.clone(), position: node.position.clone(), world, inverse: world.clone().invert() };
    }
  });
  const euler = new THREE.Euler(), delta = new THREE.Quaternion(), point = new THREE.Vector3();
  const feet = ['LeftFoot','RightFoot','LeftToeBase','RightToeBase'].map(name => bones[name]?.node).filter(Boolean);
  group.updateMatrixWorld(true);
  const footHeight = () => Math.min(...feet.map(node => node.getWorldPosition(point).y));
  const floor = feet.length ? footHeight() : 0;
  const rotate = (name, x, y, z, strength) => {
    const bone = bones[name]; if (!bone) return;
    delta.setFromEuler(euler.set(x * strength, y * strength, z * strength));
    // The imported left/right joints have different local axes. Convert the
    // choreography's model-space axes to each joint's rest orientation.
    delta.premultiply(bone.inverse).multiply(bone.world);
    bone.node.quaternion.multiply(delta);
  };
  return {
    bones,
    pose(dance, entry) {
      Object.values(bones).forEach(bone => { bone.node.quaternion.copy(bone.rotation); bone.node.position.copy(bone.position); });
      group.position.set(0, 0, 0);
      if (entry) {
        const walk = THREE.MathUtils.clamp(entry.walk ?? 1, 0, 1);
        const moving = walk < 1 ? Math.min(1, walk * 10, (1 - walk) * 10) : 0;
        const stride = Math.sin(walk * Math.PI * 8) * moving;
        rotate('Hips', 0, .07 * stride, .025 * stride, 1);
        rotate('Spine2', 0, -.10 * stride, 0, 1);
        for (const [side, sign] of [['Left', 1], ['Right', -1]]) {
          rotate(side + 'UpLeg', .34 * stride * sign, 0, 0, 1);
          rotate(side + 'Leg', .42 * Math.max(0, -stride * sign), 0, 0, 1);
          rotate(side + 'Foot', -.18 * stride * sign, 0, 0, 1);
          rotate(side + 'Arm', -.25 * stride * sign, 0, 0, 1);
          rotate(side + 'ForeArm', -.10 * moving, 0, 0, 1);
        }
        const raise = THREE.MathUtils.clamp(entry.raise || 0, 0, 1);
        rotate('LeftArm', -1.05, 0, .30, raise);
        rotate('LeftForeArm', -1.15, 0, 0, raise);
        rotate('LeftHand', .28, 0, 0, raise);
        const curl = THREE.MathUtils.clamp(entry.curl || 0, 0, 1) * raise;
        for (const finger of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) {
          for (let joint = 1; joint <= 3; joint++) {
            const bone = bones['LeftHand' + finger + joint];
            if (bone) bone.node.quaternion.multiply(delta.setFromEuler(euler.set(curl * (finger === 'Thumb' ? .65 : joint === 1 ? 1.15 : 1.45), 0, 0)));
          }
        }
        group.updateMatrixWorld(true);
        if (feet.length) group.position.y = THREE.MathUtils.clamp(floor - footHeight(), -.25, .25);
        group.position.z = -3.4 * (1 - walk);
        return;
      }
      const strength = Math.max(0, Math.min(1, dance?.amount || 0));
      if (!strength) return;
      const phase = Number.isFinite(dance?.phase) ? dance.phase : 0;
      const energy = Math.max(.25, Math.min(1, dance?.energy || .55));
      const swing = Math.sin(phase * .5), bounce = .5 + .5 * Math.cos(phase), accent = Math.sin(phase);
      const power = strength * (.65 + energy * .35);
      rotate('Hips', .035 * bounce, .10 * swing, .055 * swing, power);
      rotate('Spine2', -.045 * bounce, -.14 * swing, -.095 * swing, power);
      rotate('Head', .09 * accent, .10 * swing, .025 * swing, power);
      rotate('LeftArm', -.35 + .30 * swing, .10 * accent, .22 + .25 * bounce, power);
      rotate('RightArm', -.35 - .30 * swing, -.10 * accent, -.22 - .25 * (1-bounce), power);
      rotate('LeftForeArm', -.65 - .35 * bounce, 0, .05, power);
      rotate('RightForeArm', -.65 - .35 * (1-bounce), 0, -.05, power);
      rotate('LeftUpLeg', .13 * swing, 0, -.025 * swing, power);
      rotate('RightUpLeg', -.13 * swing, 0, -.025 * swing, power);
      rotate('LeftLeg', .12 + .14 * Math.max(0, -swing), 0, 0, power);
      rotate('RightLeg', .12 + .14 * Math.max(0, swing), 0, 0, power);
      rotate('LeftFoot', -.10 - .08 * Math.max(0, -swing), 0, 0, power);
      rotate('RightFoot', -.10 - .08 * Math.max(0, swing), 0, 0, power);
      if (bones.Hips) bones.Hips.node.position.x += swing * 1.2 * power;
      // Keep the supporting foot on the projection plane as knees and hips move.
      group.updateMatrixWorld(true);
      if (feet.length) group.position.y = THREE.MathUtils.clamp(floor - footHeight(), -.25, .25);
    }
  };
}

export async function createIronManRenderer() {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, preserveDrawingBuffer:true, powerPreference:'high-performance'});
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const hologramTime = {value:0};
  let lost = false, disposed = false;
  let lastFrame = -Infinity, lastYaw = -Infinity, renderWidth = 0, lastDancing = false, lastEntry = false;
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; lastFrame = -Infinity; });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2*Math.atan(3.35/(2*7.4))), 2.5/3.35, .1, 40);
  camera.position.set(0, 1.475, 7.4); camera.lookAt(0, 1.475, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envTarget = pmrem.fromScene(environment, .04);
  scene.environment = envTarget.texture;
  environment.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xcfefff, 0x263342, 1.3));
  const key = new THREE.DirectionalLight(0xffead8, 2.7); key.position.set(-3,5,6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x63dfff, 3.4); rim.position.set(3,3,-4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb5eaff, .7); fill.position.set(3,1,5); scene.add(fill);
  let model, group, danceRig;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    const geometries = new Set(), materials = new Set(), textures = new Set();
    model?.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : node.material ? [node.material] : []) {
        materials.add(material);
        Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => { texture.dispose(); texture.source?.data?.close?.(); });
    envTarget.dispose(); renderer.dispose();
  };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let bytes;
    try {
      const response = await fetch(new URL('../models/ironman/mark85.glb', import.meta.url), {signal:controller.signal});
      if (!response.ok) throw new Error('Iron Man model HTTP ' + response.status);
      bytes = await response.arrayBuffer();
      if (bytes.byteLength > 65 * 1024 * 1024) throw new Error('Iron Man model exceeds memory budget');
    } finally { clearTimeout(timer); }
    const gltf = await new GLTFLoader().parseAsync(bytes, '');
    model = gltf.scene;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model, true);
    const size = box.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('Invalid model bounds');
    const centre = box.getCenter(new THREE.Vector3());
    const scale = 2.84 / size.y;
    const normalized = new THREE.Group();
    normalized.add(model);
    normalized.scale.setScalar(scale);
    normalized.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
    group = new THREE.Group(); group.add(normalized); scene.add(group);
    danceRig = createDanceRig(model, group);
    model.traverse(node => {
      if (!node.isMesh) return;
      node.frustumCulled = false;
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if ('envMapIntensity' in material) material.envMapIntensity = .85;
        if (material.emissiveMap) material.emissiveIntensity = 2.2;
        if (material.transparent) material.depthWrite = false;
        // Keep the armor's PBR textures and depth, adding view-dependent rim light
        // and scan bands on its surface rather than a flat overlay across the hand.
        material.onBeforeCompile = shader => {
          shader.uniforms.hologramTime = hologramTime;
          shader.vertexShader = 'varying vec3 vHoloPosition; varying vec3 vHoloNormal;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
            vHoloPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
            vHoloNormal = normalize(mat3(modelMatrix) * objectNormal);`);
          shader.fragmentShader = 'uniform float hologramTime; varying vec3 vHoloPosition; varying vec3 vHoloNormal;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
            float holoFacing = abs(dot(normalize(vHoloNormal), normalize(cameraPosition - vHoloPosition)));
            float holoRim = pow(1.0 - holoFacing, 2.4);
            float holoScan = 0.5 + 0.5 * sin(vHoloPosition.y * 190.0 - hologramTime * 3.0);
            float holoSweep = pow(0.5 + 0.5 * sin(vHoloPosition.y * 2.4 - hologramTime * 0.85), 22.0);
            vec3 holoCyan = vec3(0.22, 0.88, 1.0);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, holoCyan, 0.075 + holoRim * 0.35);
            gl_FragColor.rgb *= 0.96 + holoScan * 0.04;
            gl_FragColor.rgb += holoCyan * (holoRim * 0.28 + holoSweep * 0.12);`);
        };
        material.customProgramCacheKey = () => 'jarunyoo-mark85-hologram-v2';
        material.needsUpdate = true;
      }
    });
  } catch (error) { dispose(); throw error; }
  return {
    canvas, renderer, scene, camera, group, danceRig,
    source: 'Iron-Man Mark 85 | Rigged — 9A Films / Nihar Arora, CC BY 4.0',
    draw(context, state, now, renderScale = state.scale) {
      if (lost || disposed) return false;
      const width = Math.max(320, Math.min(896, Math.round(renderScale * 2.5 * Math.min(devicePixelRatio || 1,1.75) / 64) * 64));
      const resized = width !== renderWidth;
      if (resized) { renderWidth = width; renderer.setSize(width, Math.round(width * 3.35 / 2.5), false); }
      // Both palms share one image at the larger required size. Drawing the
      // second copy neither resizes the GPU canvas nor renders the model again.
      const dancing = (state.dance?.amount || 0) > 0;
      const entry = !!state.entry;
      if (resized || now - lastFrame >= 1000/30 || Math.abs(state.yaw-lastYaw) > .08 || dancing !== lastDancing || entry !== lastEntry) {
        group.rotation.y = state.yaw;
        danceRig.pose(state.dance, state.entry);
        hologramTime.value = now * .001;
        renderer.render(scene, camera);
        lastFrame = now; lastYaw = state.yaw; lastDancing = dancing; lastEntry = entry;
      }
      context.save();
      context.globalAlpha *= .93;
      // Recolour the composited suit while preserving texture, depth, highlights
      // and alpha. Both palettes reuse the same expensive PBR render.
      context.filter = state.colorFilter || 'none';
      context.shadowColor = state.colorGlow || '#65dcff'; context.shadowBlur = Math.min(10, state.scale * .05);
      context.drawImage(canvas, state.x - state.scale*1.25, state.y - state.scale*3.15, state.scale*2.5, state.scale*3.35);
      context.restore();
      return true;
    },
    dispose
  };
}
