'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uStrength;
  uniform vec2 uAnchorUv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec2 screenUv = clipPosition.xy * 0.5 + 0.5;
    float verticalArc = 1.0 - sin(clamp(screenUv.y, 0.0, 1.0) * 3.14159265);
    float anchorArc = 1.0 - sin(clamp(uAnchorUv.y, 0.0, 1.0) * 3.14159265);

    // Every card is bent by the same screen-space function. The subdivided
    // plane makes its outer edges follow the curve instead of staying flat.
    // Pin the image's bottom centre to its DOM card. Only the surface bends;
    // the image frame can no longer drift away from its title and metadata.
    float surfaceCurve = (screenUv.x - 0.5) * verticalArc;
    float anchorCurve = (uAnchorUv.x - 0.5) * anchorArc;
    clipPosition.x += (surfaceCurve - anchorCurve) * uStrength * 1.55;

    gl_Position = clipPosition;
  }
`;

const fragmentShader = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform sampler2D uDepthTexture;
  uniform vec2 uTextureSize;
  uniform vec2 uRectSize;
  uniform vec2 uObjectPosition;
  uniform vec2 uResolution;
  uniform vec2 uAnchorUv;
  uniform float uStrength;
  uniform float uRadius;
  uniform float uImageScale;
  uniform float uOpacity;
  uniform vec2 uFocusPos;
  uniform vec2 uWakeOffset;
  uniform float uHover;
  uniform float uDof;
  varying vec2 vUv;

  float roundedBox(vec2 point, vec2 halfSize, float radius) {
    vec2 q = abs(point) - halfSize + radius;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
  }

  vec2 coverUv(vec2 localUv) {
    vec2 sampleUv = 0.5 + (localUv - 0.5) / max(uImageScale, 1.0);
    float rectAspect = uRectSize.x / max(uRectSize.y, 1.0);
    float textureAspect = uTextureSize.x / max(uTextureSize.y, 1.0);
    if (textureAspect > rectAspect) {
      float visibleWidth = rectAspect / textureAspect;
      sampleUv.x = (1.0 - visibleWidth) * uObjectPosition.x + sampleUv.x * visibleWidth;
    } else {
      float visibleHeight = textureAspect / rectAspect;
      sampleUv.y = (1.0 - visibleHeight) * (1.0 - uObjectPosition.y) + sampleUv.y * visibleHeight;
    }
    return sampleUv;
  }

  float softDepthField(vec2 uv) {
    // Blur the displacement field, not the colour image. The soft halo makes
    // pixels immediately around a foreground silhouette travel with it while
    // the distant wall remains almost stationary.
    vec2 nearX = vec2(0.006, 0.0);
    vec2 nearY = vec2(0.0, 0.006);
    vec2 far = vec2(0.012, 0.012);
    float field = texture2D(uDepthTexture, uv).r * 0.28;
    field += texture2D(uDepthTexture, uv + nearX).r * 0.10;
    field += texture2D(uDepthTexture, uv - nearX).r * 0.10;
    field += texture2D(uDepthTexture, uv + nearY).r * 0.10;
    field += texture2D(uDepthTexture, uv - nearY).r * 0.10;
    field += texture2D(uDepthTexture, uv + far).r * 0.08;
    field += texture2D(uDepthTexture, uv - far).r * 0.08;
    field += texture2D(uDepthTexture, uv + vec2(far.x, -far.y)).r * 0.08;
    field += texture2D(uDepthTexture, uv + vec2(-far.x, far.y)).r * 0.08;
    return smoothstep(0.025, 0.72, field);
  }

  void main() {
    vec2 screenUv = gl_FragCoord.xy / uResolution;
    float verticalArc = 1.0 - sin(clamp(screenUv.y, 0.0, 1.0) * 3.14159265);
    float anchorArc = 1.0 - sin(clamp(uAnchorUv.y, 0.0, 1.0) * 3.14159265);
    vec2 warpedUv = vUv;
    // A smaller inverse sampling shift adds cylindrical depth while the
    // vertex shader is responsible for the actual shared surface silhouette.
    float surfaceCurve = (screenUv.x - 0.5) * verticalArc;
    float anchorCurve = (uAnchorUv.x - 0.5) * anchorArc;
    warpedUv.x -= (surfaceCurve - anchorCurve) * uStrength * 0.32;

    // Match the oversized, scaled DOM image underneath so handing rendering
    // back at rest does not produce a one-frame crop/position jump.
    vec2 surfaceUv = warpedUv;
    vec2 baseTextureUv = coverUv(surfaceUv);

    vec2 safeUv = baseTextureUv;
    float mipBias = 0.0;
    // Scrolling does not need the depth pass. Keeping the expensive nine-tap
    // depth field behind a uniform branch preserves the hover interaction but
    // makes the ordinary gallery scroll a single colour-texture sample.
    if (uHover > 0.001 || uDof > 0.001) {
      vec2 viewOffset = vec2(-uFocusPos.x, uFocusPos.y) * uHover * vec2(0.0119, 0.00875);
      vec2 wakeOffset = uWakeOffset * uDof * 0.00315;
      vec2 totalOffset = viewOffset + wakeOffset;
      float depthField = softDepthField(baseTextureUv);
      float motionWeight = 0.06 + depthField * 0.88;
      safeUv = clamp(baseTextureUv - totalOffset * motionWeight, 0.002, 0.998);
      float depth = texture2D(uDepthTexture, safeUv).r;
      float focusDepth = 0.78;
      float depthDefocus = smoothstep(0.08, 0.72, abs(depth - focusDepth));
      mipBias = uDof * (1.35 + depthDefocus * 2.25);
    }
    vec4 color = texture2D(uTexture, safeUv, mipBias);
    vec2 localPoint = (surfaceUv - 0.5) * uRectSize;
    float distanceToEdge = roundedBox(localPoint, uRectSize * 0.5, uRadius);
    float alpha = 1.0 - smoothstep(-1.25, 1.25, distanceToEdge);
    gl_FragColor = vec4(color.rgb, color.a * alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

type CurveEntry = {
  element: HTMLElement;
  card: HTMLElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  pointer: THREE.Vector2;
  pointerVelocity: THREE.Vector2;
  targetPointer: THREE.Vector2;
  hover: number;
  hoverVelocity: number;
  targetHover: number;
  wakeOffset: THREE.Vector2;
  focusProgress: number;
  focusDuration: number;
  focusPulses: number;
  entranceProgress: number;
  entranceActive: boolean;
};

const parseObjectPosition = (value: string) => {
  const parts = value.trim().split(/\s+/);
  const parse = (part: string | undefined, fallback: number) => {
    if (!part) return fallback;
    if (part === 'left' || part === 'top') return 0;
    if (part === 'center') return .5;
    if (part === 'right' || part === 'bottom') return 1;
    const number = Number.parseFloat(part);
    return Number.isFinite(number) ? number / 100 : fallback;
  };
  return new THREE.Vector2(parse(parts[0], .5), parse(parts[1], .5));
};

export function ProjectCurveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    const grid = document.querySelector<HTMLElement>('#project-grid');
    if (!canvas || !grid) return;
    const supportsHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, innerWidth, innerHeight, 0, -10, 10);
    camera.position.z = 1;
    const textureCache = new Map<string, THREE.Texture>();
    const textureLoader = new THREE.TextureLoader();
    let entries: CurveEntry[] = [];
    let width = innerWidth;
    let height = innerHeight;
    let lastScrollY = scrollY;
    let lastScrollTime = performance.now();
    let motion = 0;
    let targetMotion = 0;
    let frame = 0;
    let needsSync = true;
    let lastFrameTime = performance.now();
    let pointerClientX = Number.NEGATIVE_INFINITY;
    let pointerClientY = Number.NEGATIVE_INFINITY;
    const renderResolution = new THREE.Vector2();

    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const desiredPixelRatio = Math.min(devicePixelRatio, 1.25);
      const pixelBudgetRatio = Math.sqrt((2560 * 1440) / Math.max(1, width * height));
      const pixelRatio = Math.max(.75, Math.min(desiredPixelRatio, pixelBudgetRatio));
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      renderResolution.set(renderer.domElement.width, renderer.domElement.height);
      camera.left = 0;
      camera.right = width;
      camera.top = height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();
      needsSync = true;
      if (!frame) frame = requestAnimationFrame(render);
    };

    const clearEntries = () => {
      entries.forEach(({ mesh }) => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      entries = [];
    };

    const syncEntries = () => {
      clearEntries();
      grid.querySelectorAll<HTMLElement>('.project-image').forEach((element) => {
        const image = element.querySelector<HTMLImageElement>('img');
        if (!image) return;
        const card = element.closest<HTMLElement>('.project-card');
        if (!card) return;
        let texture = textureCache.get(image.currentSrc || image.src);
        if (!texture) {
          texture = new THREE.Texture(image);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          texture.needsUpdate = image.complete;
          image.addEventListener('load', () => { if (texture) texture.needsUpdate = true; }, { once: true });
          textureCache.set(image.currentSrc || image.src, texture);
        }
        const depthUrl = element.dataset.depth;
        if (!depthUrl) return;
        let depthTexture = textureCache.get(depthUrl);
        if (!depthTexture) {
          depthTexture = textureLoader.load(depthUrl, () => {
            if (!frame) frame = requestAnimationFrame(render);
          });
          depthTexture.colorSpace = THREE.NoColorSpace;
          depthTexture.minFilter = THREE.LinearFilter;
          depthTexture.magFilter = THREE.LinearFilter;
          depthTexture.generateMipmaps = false;
          textureCache.set(depthUrl, depthTexture);
        }
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uTexture: { value: texture },
            uDepthTexture: { value: depthTexture },
            uTextureSize: { value: new THREE.Vector2(image.naturalWidth || 1, image.naturalHeight || 1) },
            uRectSize: { value: new THREE.Vector2(1, 1) },
            uObjectPosition: { value: parseObjectPosition(getComputedStyle(image).objectPosition) },
            uResolution: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
            uAnchorUv: { value: new THREE.Vector2(.5, .5) },
            uStrength: { value: 0 },
            uRadius: { value: 12 },
            uImageScale: { value: 1.0 },
            uOpacity: { value: 1 },
            uFocusPos: { value: new THREE.Vector2() },
            uWakeOffset: { value: new THREE.Vector2() },
            uHover: { value: 0 },
            uDof: { value: 0 },
          },
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 72, 40), material);
        scene.add(mesh);
        entries.push({
          element,
          card,
          mesh,
          pointer: new THREE.Vector2(),
          pointerVelocity: new THREE.Vector2(),
          targetPointer: new THREE.Vector2(),
          hover: 0,
          hoverVelocity: 0,
          targetHover: 0,
          wakeOffset: new THREE.Vector2(),
          focusProgress: 1,
          focusDuration: .34,
          focusPulses: 1,
          entranceProgress: 1,
          entranceActive: false,
        });
      });
      needsSync = false;
    };

    const updateEntryHover = (
      entry: CurveEntry,
      rect: DOMRect,
      isHovered: boolean,
    ) => {
      if (isHovered) {
        entry.targetPointer.set(
          Math.max(-1, Math.min(1, ((pointerClientX - rect.left) / rect.width - .5) * 2)),
          Math.max(-1, Math.min(1, ((pointerClientY - rect.top) / rect.height - .5) * 2)),
        );
        if (entry.targetHover === 0) {
          entry.focusProgress = 0;
          entry.focusDuration = .68;
          entry.focusPulses = 2;
          const wakeAngle = Math.random() * Math.PI * 2;
          entry.wakeOffset.set(Math.cos(wakeAngle), Math.sin(wakeAngle)).multiplyScalar(.56);
        }
        entry.targetHover = 1;
      } else {
        if (entry.targetHover > 0) {
          entry.focusProgress = 0;
          entry.focusDuration = .15;
          entry.focusPulses = 1;
        }
        entry.targetHover = 0;
        entry.targetPointer.set(0, 0);
      }
    };

    const render = (now = performance.now()) => {
      frame = 0;
      if (needsSync) syncEntries();
      const deltaTime = Math.min(.033, Math.max(.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      motion += (targetMotion - motion) * .24;
      targetMotion *= .72;
      const strength = Math.max(-.0756, Math.min(.0756, motion * .00465));
      const resolution = renderResolution;
      const columnCount = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
      let interactionAnimating = false;
      entries.forEach((entry, entryIndex) => {
        const { element, card, mesh } = entry;
        const rect = element.getBoundingClientRect();
        const visualInView = card.classList.contains('visual-in-view');
        if (!visualInView) entry.entranceActive = false;
        const visible = rect.bottom > -40 && rect.top < height + 40;
        mesh.visible = visible;
        if (!visible) return;
        if (visualInView && !entry.entranceActive) {
          entry.entranceActive = true;
          entry.entranceProgress = 0;
        }
        if (entry.entranceActive && entry.entranceProgress < 1) {
          entry.entranceProgress = Math.min(1, entry.entranceProgress + deltaTime / 1.35);
        }
        const entranceEase = entry.entranceActive
          ? 1 - Math.pow(2, -10 * entry.entranceProgress)
          : 1;
        const entranceScaleEase = entry.entranceActive
          ? 1 - Math.pow(1 - entry.entranceProgress, 3)
          : 1;
        const entranceScale = .7 + entranceScaleEase * .3;
        const pointerIsInside =
          supportsHover &&
          pointerClientX >= rect.left && pointerClientX <= rect.right &&
          pointerClientY >= rect.top && pointerClientY <= rect.bottom;
        updateEntryHover(entry, rect, pointerIsInside);
        mesh.position.set(rect.left + rect.width * .5, height - rect.top - rect.height * .5, 0);
        const columnPosition = entryIndex % columnCount;
        const rowCenter = (columnCount - 1) * .5;
        const entranceSide = rowCenter > 0 ? (columnPosition - rowCenter) / rowCenter : 0;
        mesh.rotation.z = (1 - entranceEase) * entranceSide * .012;
        mesh.scale.set(rect.width * entranceScale, rect.height * entranceScale, 1);
        mesh.material.uniforms.uRectSize.value.set(rect.width, rect.height);
        mesh.material.uniforms.uResolution.value.copy(resolution);
        mesh.material.uniforms.uAnchorUv.value.set(
          (rect.left + rect.width * .5) / width,
          1 - rect.bottom / height,
        );
        mesh.material.uniforms.uStrength.value = strength;
        const pointerFrequency = 1.35;
        const pointerOmega = Math.PI * 2 * pointerFrequency;
        const pointerDamping = .72;
        entry.pointerVelocity.x += ((entry.targetPointer.x - entry.pointer.x) * pointerOmega * pointerOmega - 2 * pointerDamping * pointerOmega * entry.pointerVelocity.x) * deltaTime;
        entry.pointerVelocity.y += ((entry.targetPointer.y - entry.pointer.y) * pointerOmega * pointerOmega - 2 * pointerDamping * pointerOmega * entry.pointerVelocity.y) * deltaTime;
        entry.pointer.x += entry.pointerVelocity.x * deltaTime;
        entry.pointer.y += entry.pointerVelocity.y * deltaTime;

        const hoverOmega = Math.PI * 2 * 1.65;
        entry.hoverVelocity += ((entry.targetHover - entry.hover) * hoverOmega * hoverOmega - 2 * .78 * hoverOmega * entry.hoverVelocity) * deltaTime;
        entry.hover += entry.hoverVelocity * deltaTime;
        const hoverRatio = Math.max(0, Math.min(1, entry.hover));
        entry.wakeOffset.multiplyScalar(Math.exp(-7.5 * deltaTime));
        let focusBlur = 0;
        if (entry.focusProgress < 1) {
          entry.focusProgress = Math.min(1, entry.focusProgress + deltaTime / entry.focusDuration);
          if (entry.focusPulses === 2) {
            const localPhase = entry.focusProgress < .5
              ? entry.focusProgress / .5
              : (entry.focusProgress - .5) / .5;
            const pulse = Math.pow(Math.sin(localPhase * Math.PI), entry.focusProgress < .5 ? .78 : .9);
            focusBlur = pulse * (entry.focusProgress < .5 ? 1 : .44);
          } else {
            focusBlur = Math.pow(Math.sin(entry.focusProgress * Math.PI), .7);
          }
        }
        mesh.material.uniforms.uImageScale.value = 1.0 + hoverRatio * .018 + (1 - entranceEase) * .025;
        mesh.material.uniforms.uFocusPos.value.copy(entry.pointer);
        mesh.material.uniforms.uWakeOffset.value.copy(entry.wakeOffset);
        mesh.material.uniforms.uHover.value = hoverRatio;
        mesh.material.uniforms.uDof.value = focusBlur * (.35 + hoverRatio * .65);
        mesh.material.uniforms.uOpacity.value = entry.entranceActive && entry.entranceProgress < 1
          ? Number.parseFloat(getComputedStyle(card).opacity)
          : 1;
        const image = element.querySelector<HTMLImageElement>('img');
        if (image?.naturalWidth && image.naturalHeight) {
          mesh.material.uniforms.uTextureSize.value.set(image.naturalWidth, image.naturalHeight);
        }
        if (
          Math.abs(entry.targetHover - entry.hover) > .001 ||
          Math.abs(entry.hoverVelocity) > .001 ||
          entry.pointer.distanceTo(entry.targetPointer) > .001 ||
          entry.pointerVelocity.lengthSq() > .00001 ||
          entry.wakeOffset.lengthSq() > .00001 ||
          entry.focusProgress < 1 ||
          (entry.entranceActive && entry.entranceProgress < 1)
        ) interactionAnimating = true;
      });
      renderer.clear();
      renderer.render(scene, camera);

      if (Math.abs(motion) > .001 || Math.abs(targetMotion) > .001 || interactionAnimating) {
        frame = requestAnimationFrame(render);
      } else if (motion !== 0 || targetMotion !== 0) {
        motion = 0;
        targetMotion = 0;
        frame = requestAnimationFrame(render);
      }
    };

    const onScroll = () => {
      const nextScrollY = scrollY;
      const delta = nextScrollY - lastScrollY;
      const now = performance.now();
      const elapsedSeconds = Math.max(.016, (now - lastScrollTime) / 1000);
      lastScrollY = nextScrollY;
      lastScrollTime = now;
      const rect = grid.getBoundingClientRect();
      if (rect.bottom > -height * .25 && rect.top < height * 1.25) {
        // Both scroll directions bend the gallery toward the same side. The
        // deformation follows actual scroll velocity: a careful scroll stays
        // almost flat while a fast gesture can still reach the existing cap.
        const scrollSpeed = Math.abs(delta) / elapsedSeconds;
        const speedRatio = Math.min(1, scrollSpeed / 5000);
        const velocityDrivenMotion = 38 * Math.pow(speedRatio, .82);
        targetMotion = Math.max(targetMotion * .35, velocityDrivenMotion);
        if (!frame) frame = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!supportsHover) return;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onPointerLeave = () => {
      pointerClientX = Number.NEGATIVE_INFINITY;
      pointerClientY = Number.NEGATIVE_INFINITY;
      entries.forEach((entry) => {
        if (entry.targetHover > 0) {
          entry.focusProgress = 0;
          entry.focusDuration = .15;
          entry.focusPulses = 1;
        }
        entry.targetHover = 0;
        entry.targetPointer.set(0, 0);
      });
      if (!frame) frame = requestAnimationFrame(render);
    };

    const observer = new MutationObserver(() => {
      needsSync = true;
      if (!frame) frame = requestAnimationFrame(render);
    });
    // Only resync when cards are added to or removed from the grid (for
    // example by the category filter). Text reveal animations update nested
    // text nodes; observing the whole subtree made those harmless updates
    // recreate every mesh and restart every 70% -> 100% entrance animation.
    observer.observe(grid, { childList: true });
    resize();
    syncEntries();
    render();
    addEventListener('resize', resize);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener('resize', resize);
      removeEventListener('scroll', onScroll);
      removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      clearEntries();
      textureCache.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="project-curve-field" aria-hidden="true" />;
}

