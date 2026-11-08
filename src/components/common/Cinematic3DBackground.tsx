import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Cinematic3DBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to adapt performance
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02130c, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Dark Forest Green + Radiant Orange Rim)
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.2);
    scene.add(ambientLight);

    const orangeLight = new THREE.PointLight(0xf97316, 3.5, 30);
    orangeLight.position.set(8, 6, 8);
    scene.add(orangeLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2.8, 30);
    emeraldLight.position.set(-8, -5, 6);
    scene.add(emeraldLight);

    // 3. 3D Geometric Objects (Democracy / Ballot Seals & Tokens)
    const group = new THREE.Group();
    scene.add(group);

    // Outer Torus Ring (Emerald glass wireframe)
    const torusGeo = new THREE.TorusGeometry(5.8, 0.08, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x065f46,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.85,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 4;
    group.add(torusMesh);

    // Inner Secondary Orange Ring
    const torusGeo2 = new THREE.TorusGeometry(4.2, 0.05, 16, 80);
    const torusMat2 = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xc2410c,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.9,
    });
    const torusMesh2 = new THREE.Mesh(torusGeo2, torusMat2);
    torusMesh2.rotation.y = Math.PI / 3;
    group.add(torusMesh2);

    // Center Geometric Core (Floating Ballot Prism / Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      roughness: 0.15,
      metalness: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Smaller accent orbital octahedrons
    const miniOctaGeo = new THREE.OctahedronGeometry(0.6, 0);
    const miniOctaMat = new THREE.MeshStandardMaterial({
      color: 0xfb923c,
      emissive: 0xea580c,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.8,
    });

    const satellites: THREE.Mesh[] = [];
    const numSatellites = isSoftwareGl ? 3 : 6;
    for (let i = 0; i < numSatellites; i++) {
      const mesh = new THREE.Mesh(miniOctaGeo, miniOctaMat);
      const angle = (i / numSatellites) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 7.5, Math.sin(angle) * 3.5, (Math.random() - 0.5) * 4);
      group.add(mesh);
      satellites.push(mesh);
    }

    // 4. Particle Constellation (Emerald & Amber / Orange star dust)
    const particleCount = isSoftwareGl ? 120 : 350;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cEmerald = new THREE.Color(0x10b981);
    const cOrange = new THREE.Color(0xf97316);
    const cAmber = new THREE.Color(0xfbbf24);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 35;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 25;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 20 - 2;

      const pick = Math.random();
      const col = pick < 0.55 ? cEmerald : pick < 0.85 ? cOrange : cAmber;
      particleColors[i3] = col.r;
      particleColors[i3 + 1] = col.g;
      particleColors[i3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: isSoftwareGl ? 0.15 : 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Mouse Parallax Choreography
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 6. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop with Software WebGL Guard
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 6);
    }

    function tick() {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;

      // Group subtle rotation & camera drift
      group.rotation.x = 0.2 + mouse.y * 0.35 + Math.sin(elapsedTime * 0.25) * 0.1;
      group.rotation.y = elapsedTime * 0.12 + mouse.x * 0.45;

      coreMesh.rotation.y = -elapsedTime * 0.25;
      coreMesh.rotation.z = Math.sin(elapsedTime * 0.35) * 0.25;

      torusMesh.rotation.z = elapsedTime * 0.08;
      torusMesh2.rotation.x = -elapsedTime * 0.14;

      // Orbit satellites
      satellites.forEach((sat, idx) => {
        const speed = 0.4 + idx * 0.1;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
        sat.position.y += Math.sin(elapsedTime * speed + idx) * 0.005;
      });

      // Subtle particle drift
      particles.rotation.y = elapsedTime * 0.025;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

      // Dynamic light movement
      orangeLight.position.x = 8 + Math.sin(elapsedTime * 0.5) * 2;
      orangeLight.position.y = 6 + Math.cos(elapsedTime * 0.4) * 2;
      emeraldLight.position.x = -8 + Math.cos(elapsedTime * 0.45) * 2;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 8. Cleanup on unmount
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      torusGeo.dispose();
      torusMat.dispose();
      torusGeo2.dispose();
      torusMat2.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      miniOctaGeo.dispose();
      miniOctaMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-700"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #063826 0%, #031c13 45%, #010c08 100%)',
      }}
    />
  );
};
