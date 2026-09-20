import { createIronManRenderer } from './ironman-menu-renderer.js';
import { createSpiderManRenderer } from './spiderman-menu-renderer.js';

const menu = document.getElementById('menu');
const ironHost = document.getElementById('menuIronMan');
const ironCanvas = document.getElementById('menuIronCanvas');
const spiderHost = document.getElementById('menuSpiderMan');
const spiderCanvas = document.getElementById('menuSpiderCanvas');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = matchMedia('(max-width: 700px)');

if (menu && ironHost && ironCanvas && spiderHost && spiderCanvas) {
  const ironOutput = {
    host: ironHost,
    canvas: ironCanvas,
    context: ironCanvas.getContext('2d', { alpha: true, desynchronized: true }),
    width: 0,
    height: 0
  };
  const spiderOutput = {
    host: spiderHost,
    canvas: spiderCanvas,
    context: spiderCanvas.getContext('2d', { alpha: true, desynchronized: true }),
    width: 0,
    height: 0
  };
  let ironRenderer = null;
  let spiderRenderer = null;
  let frame = 0;
  let disposed = false;
  let loading = false;
  let pointerYaw = 0;
  let lastIronPose = '';
  let lastSpiderPose = '';

  function isMenuVisible() {
    if (document.hidden || compactScreen.matches) return false;
    const style = getComputedStyle(menu);
    return style.display !== 'none' && style.visibility !== 'hidden' && menu.getClientRects().length > 0;
  }

  function resizeOutput(output) {
    const rect = output.host.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (width !== output.width || height !== output.height) {
      output.width = width;
      output.height = height;
      output.canvas.width = width;
      output.canvas.height = height;
    }
    return { width: rect.width, height: rect.height, dpr };
  }

  function prepareOutput(output) {
    const size = resizeOutput(output);
    output.context.setTransform(1, 0, 0, 1, 0, 0);
    output.context.clearRect(0, 0, output.canvas.width, output.canvas.height);
    output.context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    return size;
  }

  function smoothStep(value) {
    const v = Math.max(0, Math.min(1, value));
    return v * v * (3 - 2 * v);
  }

  function actionBlend(local, duration) {
    return smoothStep(Math.min(1, local / 0.65, (duration - local) / 0.65));
  }

  function getIronPose(now) {
    if (reducedMotion.matches) return { name: 'repulsor', entry: { walk: 1, raise: 0.82, curl: 0 }, dance: null };
    const seconds = (now * 0.001) % 14;
    if (seconds < 3.4) return { name: 'repulsor', entry: { walk: 1, raise: smoothStep(seconds / 1.1), curl: 0 }, dance: null };
    if (seconds < 7.4) return { name: 'motion', entry: null, dance: { amount: 0.82, phase: now * 0.0044, energy: 0.8 } };
    if (seconds < 11.1) {
      const charge = (seconds - 7.4) / 3.7;
      return { name: 'charge', entry: { walk: 1, raise: 1, curl: 0.22 + Math.sin(charge * Math.PI * 4) * 0.1 }, dance: null };
    }
    return { name: 'scan', entry: null, dance: { amount: 0.28, phase: now * 0.0021, energy: 0.42 } };
  }

  function getSpiderPose(now) {
    if (reducedMotion.matches) return { mode: 'idle', amount: 1, phase: 0 };
    const seconds = (now * 0.001) % 16;
    if (seconds < 4) return { mode: 'idle', amount: 1, phase: now * 0.0022 };
    if (seconds < 8) return { mode: 'web', amount: actionBlend(seconds - 4, 4), phase: now * 0.003 };
    if (seconds < 12) return { mode: 'guard', amount: actionBlend(seconds - 8, 4), phase: now * 0.0033 };
    return { mode: 'crouch', amount: actionBlend(seconds - 12, 4), phase: now * 0.0027 };
  }

  function draw(now) {
    frame = requestAnimationFrame(draw);
    if (!isMenuVisible()) return;

    if (ironRenderer) {
      const size = prepareOutput(ironOutput);
      if (size.width >= 20 && size.height >= 20) {
        const scale = Math.min(size.height / 3.35, size.width / 2.5) * 0.97;
        const pose = getIronPose(now);
        if (pose.name !== lastIronPose) {
          lastIronPose = pose.name;
          ironHost.dataset.pose = pose.name;
        }
        ironRenderer.draw(ironOutput.context, {
          x: size.width * 0.5,
          y: size.height * 0.99,
          scale,
          yaw: pointerYaw + Math.sin(now * 0.00055) * 0.09,
          entry: pose.entry,
          dance: pose.dance,
          colorGlow: '#5ce8ff'
        }, now, scale);
      }
    }

    if (spiderRenderer) {
      const size = prepareOutput(spiderOutput);
      if (size.width >= 20 && size.height >= 20) {
        const scale = Math.min(size.height / 3.35, size.width / 2.5) * 0.98;
        const pose = getSpiderPose(now);
        if (pose.mode !== lastSpiderPose) {
          lastSpiderPose = pose.mode;
          spiderHost.dataset.pose = pose.mode;
        }
        spiderHost.style.setProperty('--web-strength', pose.amount.toFixed(3));
        spiderRenderer.draw(spiderOutput.context, {
          x: size.width * 0.5,
          y: size.height * 0.99,
          scale,
          yaw: pointerYaw * 0.82 - Math.sin(now * 0.00048) * 0.075,
          pose
        }, now, scale);
      }
    }
  }

  async function loadCharacters() {
    if (loading || disposed || compactScreen.matches || (ironRenderer && spiderRenderer)) return;
    loading = true;
    const [ironResult, spiderResult] = await Promise.allSettled([
      ironRenderer ? Promise.resolve(ironRenderer) : createIronManRenderer(),
      spiderRenderer ? Promise.resolve(spiderRenderer) : createSpiderManRenderer()
    ]);
    if (disposed) {
      if (ironResult.status === 'fulfilled') ironResult.value.dispose();
      if (spiderResult.status === 'fulfilled') spiderResult.value.dispose();
      return;
    }
    if (ironResult.status === 'fulfilled') {
      ironRenderer = ironResult.value;
      ironHost.classList.add('is-ready');
    } else {
      ironHost.classList.add('is-error');
      console.warn('The Iron Man menu model could not be loaded.', ironResult.reason);
    }
    if (spiderResult.status === 'fulfilled') {
      spiderRenderer = spiderResult.value;
      spiderHost.classList.add('is-ready');
    } else {
      spiderHost.classList.add('is-error');
      console.warn('The Spider-Man menu model could not be loaded.', spiderResult.reason);
    }
    loading = false;
    if (!frame && (ironRenderer || spiderRenderer)) frame = requestAnimationFrame(draw);
  }

  menu.addEventListener('pointermove', event => {
    const rect = menu.getBoundingClientRect();
    pointerYaw = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.38;
  }, { passive: true });
  menu.addEventListener('pointerleave', () => { pointerYaw = 0; }, { passive: true });

  const begin = () => {
    if (compactScreen.matches) return;
    if ('requestIdleCallback' in window) requestIdleCallback(loadCharacters, { timeout: 900 });
    else setTimeout(loadCharacters, 280);
  };
  if (document.readyState === 'complete') begin();
  else addEventListener('load', begin, { once: true });
  compactScreen.addEventListener?.('change', event => { if (!event.matches) loadCharacters(); });

  addEventListener('beforeunload', () => {
    disposed = true;
    cancelAnimationFrame(frame);
    ironRenderer?.dispose();
    spiderRenderer?.dispose();
  }, { once: true });
}
