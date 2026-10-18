"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Satellite3DProps {
  attitudeError?: number;
  rwRpm?: number;
  slewRate?: number;
}

export function Satellite3D({ attitudeError = 0.62, rwRpm = 5740, slewRate = 0.04 }: Satellite3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = currentMount.clientWidth || 400;
    const height = currentMount.clientHeight || 320;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    sunLight.position.set(-6, -4, -5);
    scene.add(sunLight);

    // Spacecraft Group
    const satGroup = new THREE.Group();
    scene.add(satGroup);

    // 1. Central Bus (CubeSat body)
    const busGeo = new THREE.BoxGeometry(1.2, 1.2, 1.6);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const bus = new THREE.Mesh(busGeo, busMat);
    satGroup.add(bus);

    // Gold Multi-Layer Insulation (MLI) wrap layer
    const mliGeo = new THREE.BoxGeometry(1.22, 1.22, 0.8);
    const mliMat = new THREE.MeshStandardMaterial({
      color: 0xdfa010,
      metalness: 0.9,
      roughness: 0.2,
    });
    const mli = new THREE.Mesh(mliGeo, mliMat);
    satGroup.add(mli);

    // 2. Solar Arrays (Left & Right Wings)
    const panelGeo = new THREE.BoxGeometry(2.4, 0.04, 0.9);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x034b8c,
      metalness: 0.5,
      roughness: 0.3,
    });

    const leftWing = new THREE.Mesh(panelGeo, panelMat);
    leftWing.position.set(1.9, 0, 0);
    satGroup.add(leftWing);

    const rightWing = new THREE.Mesh(panelGeo, panelMat);
    rightWing.position.set(-1.9, 0, 0);
    satGroup.add(rightWing);

    // Solar Wing Mount Struts
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });

    const leftStrut = new THREE.Mesh(strutGeo, strutMat);
    leftStrut.rotation.z = Math.PI / 2;
    leftStrut.position.set(0.8, 0, 0);
    satGroup.add(leftStrut);

    const rightStrut = new THREE.Mesh(strutGeo, strutMat);
    rightStrut.rotation.z = Math.PI / 2;
    rightStrut.position.set(-0.8, 0, 0);
    satGroup.add(rightStrut);

    // 3. High-Gain Telemetry Dish Antenna
    const dishGeo = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 0, 0.9);
    dish.rotation.x = Math.PI;
    satGroup.add(dish);

    // Feed horn
    const hornGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
    const horn = new THREE.Mesh(hornGeo, strutMat);
    horn.position.set(0, 0, 1.05);
    horn.rotation.x = Math.PI / 2;
    satGroup.add(horn);

    // 4. Coordinate Axes (Body frame)
    const axesHelper = new THREE.AxesHelper(1.8);
    satGroup.add(axesHelper);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Simulate subtle orbital yaw/pitch oscillation scaled by attitude error
      const wobble = Math.sin(Date.now() * 0.0015) * (attitudeError * 0.2);
      satGroup.rotation.y += 0.004 + (slewRate * 0.02);
      satGroup.rotation.x = wobble;
      satGroup.rotation.z = Math.cos(Date.now() * 0.001) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [attitudeError, rwRpm, slewRate]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "340px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "8px",
        backgroundColor: "rgba(3, 7, 18, 0.8)",
      }}
    />
  );
}
