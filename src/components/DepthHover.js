"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DepthHover() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f5f0da"); // your background color

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const texture = loader.load("/depths/image1.png");
    const depth = loader.load("/depths/image1d.png");

    const geometry = new THREE.PlaneGeometry(1.6, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uDepth: { value: depth },
        uMouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        uniform sampler2D uDepth;
        uniform vec2 uMouse;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          float d = texture2D(uDepth, uv).r;

          vec3 pos = position;
          pos.z -= d * 0.32 * uMouse.x;
          pos.y += d * 0.22 * uMouse.y;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(uTexture, vUv); 
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const mouse = new THREE.Vector2();
    const smooth = new THREE.Vector2();

    window.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
      requestAnimationFrame(animate);

      smooth.x += (mouse.x - smooth.x) * 0.08;
      smooth.y += (mouse.y - smooth.y) * 0.08;

      material.uniforms.uMouse.value = smooth;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    return () => mountRef.current.removeChild(renderer.domElement);
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
