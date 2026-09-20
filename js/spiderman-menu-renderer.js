/* Textured rigged Spider-Man model; attribution travels with the offline GLB in models/spiderman. */
import * as THREE from '../vendor/three/three.module.min.js';
import { GLTFLoader } from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from '../vendor/three/examples/jsm/environments/RoomEnvironment.js';

function createSpiderRig(model, group) {
  const bones = {};
  group.updateMatrixWorld(true);
  model.traverse(node => {
    const name = node.name.match(/(?:mixamorig:)?(Hips|Spine|Spine1|Spine2|Neck|Head|LeftShoulder|RightShoulder|LeftArm|RightArm|LeftForeArm|RightForeArm|LeftUpLeg|RightUpLeg|LeftLeg|RightLeg|LeftFoot|RightFoot|LeftToeBase|RightToeBase|(?:Left|Right)Hand(?:(?:Thumb|Index|Middle|Ring|Pinky)[1234])?)(?:_\d+)?$/)?.[1];
    if (!node.isBone || !name) return;
    const world = node.getWorldQuaternion(new THREE.Quaternion());
    bones[name] = {
      node,
      rotation: node.quaternion.clone(),
      position: node.position.clone(),
      world,
      inverse: world.clone().invert()
    };
  });
  const euler = new THREE.Euler();
  const delta = new THREE.Quaternion();
  const point = new THREE.Vector3();
  const feet = ['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase'].map(name => bones[name]?.node).filter(Boolean);
  group.updateMatrixWorld(true);
  const floor = feet.length ? Math.min(...feet.map(node => node.getWorldPosition(point).y)) : 0;
  const rotate = (name, x, y, z, strength = 1) => {
    const bone = bones[name];
    if (!bone || !strength) return;
    delta.setFromEuler(euler.set(x * strength, y * strength, z * strength));
    delta.premultiply(bone.inverse).multiply(bone.world);
    bone.node.quaternion.multiply(delta);
  };
  const curlFinger = (side, finger, amount) => {
    for (let joint = 1; joint <= 4; joint++) {
      const bone = bones[`${side}Hand${finger}${joint}`];
      if (!bone) continue;
      const bend = amount * (finger === 'Thumb' ? 0.62 : joint === 1 ? 0.82 : 1.12);
      bone.node.quaternion.multiply(delta.setFromEuler(euler.set(bend, 0, 0)));
    }
  };
  return {
    bones,
    pose(pose = {}) {
      Object.values(bones).forEach(bone => {
        bone.node.quaternion.copy(bone.rotation);
        bone.node.position.copy(bone.position);
      });
      group.position.set(0, 0, 0);
      const phase = Number.isFinite(pose.phase) ? pose.phase : 0;
      const breathe = Math.sin(phase) * 0.5 + 0.5;
      const mode = pose.mode || 'idle';
      const strength = 1;
      const action = Math.max(0, Math.min(1, pose.amount ?? 1));

      // Bring the Mixamo rest pose into a relaxed cinematic hero stance.
      rotate('LeftArm', 0.08, 0.05, -1.08, strength);
      rotate('RightArm', -0.08, -0.05, 1.08, strength);
      rotate('LeftForeArm', 0.02, 0, -0.18, strength);
      rotate('RightForeArm', 0.02, 0, 0.18, strength);
      rotate('Spine2', 0.018 * breathe, 0.035 * Math.sin(phase * 0.5), 0, strength);
      rotate('Head', -0.025 + 0.035 * breathe, -0.055 * Math.sin(phase * 0.5), 0, strength);
      rotate('LeftUpLeg', 0.035, 0, -0.02, strength);
      rotate('RightUpLeg', -0.02, 0, 0.02, strength);

      if (mode === 'web') {
        rotate('LeftShoulder', -0.18, 0, 0.14, action);
        rotate('LeftArm', -0.62, 0.12, 1.28, action);
        rotate('LeftForeArm', -0.86, 0.08, 0.22, action);
        rotate('LeftHand', -0.18, 0.18, -0.08, action);
        curlFinger('Left', 'Middle', 1.18 * action);
        curlFinger('Left', 'Ring', 1.24 * action);
        curlFinger('Left', 'Thumb', 0.62 * action);
        rotate('Spine2', 0.05, -0.12, -0.05, action);
        rotate('Head', -0.04, 0.16, 0, action);
      } else if (mode === 'guard') {
        rotate('LeftArm', -0.42, -0.08, 0.62, action);
        rotate('RightArm', -0.48, 0.08, -0.62, action);
        rotate('LeftForeArm', -1.08, 0, 0.22, action);
        rotate('RightForeArm', -1.08, 0, -0.22, action);
        rotate('LeftHand', 0.22, 0, 0, action);
        rotate('RightHand', 0.22, 0, 0, action);
        rotate('Spine2', 0.08, 0.1 * Math.sin(phase), 0, action);
      } else if (mode === 'crouch') {
        rotate('Hips', 0.18, -0.08, -0.08, action);
        rotate('Spine', -0.14, 0.06, 0.08, action);
        rotate('Spine2', -0.1, -0.08, 0, action);
        rotate('LeftUpLeg', -0.72, 0, -0.18, action);
        rotate('RightUpLeg', -0.48, 0, 0.22, action);
        rotate('LeftLeg', 1.12, 0, 0, action);
        rotate('RightLeg', 0.92, 0, 0, action);
        rotate('LeftFoot', -0.42, 0, 0, action);
        rotate('RightFoot', -0.36, 0, 0, action);
        rotate('LeftArm', -0.36, 0, 0.45, action);
        rotate('RightArm', -0.34, 0, -0.32, action);
        rotate('LeftForeArm', -0.8, 0, 0.15, action);
        rotate('RightForeArm', -0.72, 0, -0.15, action);
      } else {
        rotate('LeftForeArm', -0.08 * breathe, 0, 0, strength);
        rotate('RightForeArm', -0.08 * (1 - breathe), 0, 0, strength);
      }

      group.updateMatrixWorld(true);
      if (feet.length) {
        const currentFloor = Math.min(...feet.map(node => node.getWorldPosition(point).y));
        group.position.y = THREE.MathUtils.clamp(floor - currentFloor, -0.55, 0.55);
      }
    }
  };
}

export async function createSpiderManRenderer() {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  let lost = false;
  let disposed = false;
  let lastFrame = -Infinity;
  let renderWidth = 0;
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; lastFrame = -Infinity; });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2 * Math.atan(3.35 / (2 * 7.4))), 2.5 / 3.35, 0.1, 40);
  camera.position.set(0, 1.48, 7.4);
  camera.lookAt(0, 1.48, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = envTarget.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xd8f5ff, 0x121b35, 1.55));
  const key = new THREE.DirectionalLight(0xffe5df, 3.1);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const cyanRim = new THREE.DirectionalLight(0x55deff, 4.1);
  cyanRim.position.set(4, 3, -5);
  scene.add(cyanRim);
  const redRim = new THREE.DirectionalLight(0xff3567, 1.8);
  redRim.position.set(-4, 1, -3);
  scene.add(redRim);

  let model;
  let group;
  let spiderRig;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    model?.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : node.material ? [node.material] : []) {
        materials.add(material);
        Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
    envTarget.dispose();
    renderer.dispose();
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let bytes;
    try {
      const response = await fetch(new URL('../models/spiderman/spiderman.glb', import.meta.url), { signal: controller.signal });
      if (!response.ok) throw new Error(`Spider-Man model HTTP ${response.status}`);
      bytes = await response.arrayBuffer();
      if (bytes.byteLength > 40 * 1024 * 1024) throw new Error('Spider-Man model exceeds memory budget');
    } finally {
      clearTimeout(timer);
    }
    const gltf = await new GLTFLoader().parseAsync(bytes, '');
    model = gltf.scene;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model, true);
    const size = box.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('Invalid Spider-Man model bounds');
    const centre = box.getCenter(new THREE.Vector3());
    const scale = 2.9 / size.y;
    const normalized = new THREE.Group();
    normalized.add(model);
    normalized.scale.setScalar(scale);
    normalized.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
    group = new THREE.Group();
    group.add(normalized);
    scene.add(group);
    spiderRig = createSpiderRig(model, group);

    model.traverse(node => {
      if (!node.isMesh) return;
      node.frustumCulled = false;
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if ('envMapIntensity' in material) material.envMapIntensity = 0.92;
        if (material.emissiveMap) material.emissiveIntensity = 1.35;
        material.onBeforeCompile = shader => {
          shader.vertexShader = 'varying vec3 vSpiderWorld; varying vec3 vSpiderNormal;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
            vSpiderWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
            vSpiderNormal = normalize(mat3(modelMatrix) * objectNormal);`);
          shader.fragmentShader = 'varying vec3 vSpiderWorld; varying vec3 vSpiderNormal;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
            float spiderFacing = abs(dot(normalize(vSpiderNormal), normalize(cameraPosition - vSpiderWorld)));
            float spiderRim = pow(1.0 - spiderFacing, 2.5);
            gl_FragColor.rgb += vec3(0.16, 0.72, 1.0) * spiderRim * 0.22;`);
        };
        material.customProgramCacheKey = () => 'aion-spiderman-cinematic-v1';
        material.needsUpdate = true;
      }
    });
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    source: 'The Amazing Spider Man 2 Rigged Model — Shitlock_Homeless, CC BY 4.0',
    draw(context, state, now, renderScale = state.scale) {
      if (lost || disposed) return false;
      const width = Math.max(320, Math.min(896, Math.round(renderScale * 2.5 * Math.min(devicePixelRatio || 1, 1.75) / 64) * 64));
      if (width !== renderWidth) {
        renderWidth = width;
        renderer.setSize(width, Math.round(width * 3.35 / 2.5), false);
      }
      if (now - lastFrame >= 1000 / 30) {
        group.rotation.y = state.yaw || 0;
        spiderRig.pose(state.pose);
        renderer.render(scene, camera);
        lastFrame = now;
      }
      context.save();
      context.globalAlpha *= 0.97;
      context.shadowColor = '#48dfff';
      context.shadowBlur = Math.min(11, state.scale * 0.06);
      context.drawImage(canvas, state.x - state.scale * 1.25, state.y - state.scale * 3.15, state.scale * 2.5, state.scale * 3.35);
      context.restore();
      return true;
    },
    dispose
  };
}
