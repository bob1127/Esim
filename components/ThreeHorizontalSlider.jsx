// components/ThreeHorizontalSlider.jsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Lenis from "@studio-freight/lenis";

export default function ThreeHorizontalSlider() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const fpsRef = useRef(null);
  const progRef = useRef(null);

  useEffect(() => {
    let lenis = null;
    let rafId = null;
    let disposed = false;
    let resizeTimeout = null;
    let sceneCleanup = null;

    const SHOW_DEBUG = false; // 想看 FPS/進度再開 true

    // FPS 監測
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    function updateFPS(now) {
      frameCount++;
      if (now - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
        if (SHOW_DEBUG && fpsRef.current) {
          fpsRef.current.textContent = `FPS: ${fps}`;
        }
      }
    }

    const total = 7;
    const images = [];
    let loaded = 0;

    // === 載入圖片 ===
    for (let i = 1; i <= total; i++) {
      const img = new Image();
      img.onload = checkLoaded;
      img.onerror = checkLoaded;
      img.src = `/assets/img${i}.jpg`;
      images.push(img);
    }

    function checkLoaded() {
      loaded++;
      if (loaded === total) {
        sceneCleanup = init(); // 圖片全載完再建場景
      }
    }

    // === 區段進度（只算 Slider 這一段） ===
    function sectionProgress() {
      const el = sectionRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / totalScrollable)); // 0~1
    }

    // === 初始化 Three.js ===
    function init() {
      if (disposed) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.setClearColor(0x000000, 0);

      // === 彎曲曲面 ===
      const parentWidth = 70;
      const parentHeight = 18;
      const curvature = 25;
      const segmentsX = 96;
      const segmentsY = 48;
      const geometry = new THREE.PlaneGeometry(
        parentWidth,
        parentHeight,
        segmentsX,
        segmentsY
      );

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const dist = Math.abs(x / (parentWidth / 2));
        pos[i + 2] = Math.pow(dist, 2) * curvature; // 內凹
      }
      geometry.computeVertexNormals();

      // === 紋理畫布 ===
      const texCanvas = document.createElement("canvas");
      const ctx = texCanvas.getContext("2d");
      texCanvas.width = 2048;
      texCanvas.height = 512;

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // === 相機 ===
      camera.position.set(0, 4, 28);
      camera.lookAt(0, 0, 0);

      // === Slides 設定 ===
      const fixedRatio = 1;
      const totalSlides = total;
      const slideWidth = 8;
      const gap = 1.4;
      const cycleWidth = totalSlides * (slideWidth + gap);

      const titles = [
        "Field Unit",
        "Astral Convergence",
        "Eclipse Core",
        "Luminous",
        "Serenity",
        "Nebula Point",
        "Horizon",
      ];

      function updateTexture(offset = 0) {
        ctx.fillStyle = "#FBF8F5";
        ctx.fillRect(0, 0, texCanvas.width, texCanvas.height);

        const fontSize = 46;
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";

        const extra = 2;
        for (let i = -extra; i < totalSlides + extra; i++) {
          let slideX = i * (slideWidth + gap);
          slideX += offset * cycleWidth;
          const textureX = (slideX / cycleWidth) * texCanvas.width;
          let wrappedX = textureX % texCanvas.width;
          if (wrappedX < 0) wrappedX += texCanvas.width;

          const idx = ((i % totalSlides) + totalSlides) % totalSlides;
          const rect = {
            x: wrappedX,
            y: texCanvas.height * 0.22,
            width: (slideWidth / cycleWidth) * texCanvas.width,
            height: texCanvas.height * 0.56,
          };

          let drawW = rect.width;
          let drawH = drawW / fixedRatio;
          if (drawH > rect.height) {
            drawH = rect.height;
            drawW = drawH * fixedRatio;
          }
          const drawX = rect.x + (rect.width - drawW) / 2;
          const drawY = rect.y + (rect.height - drawH) / 2;

          const img = images[idx];
          if (img) {
            const overflowR = drawX + drawW - texCanvas.width;
            if (overflowR > 0) {
              ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                drawX,
                drawY,
                drawW - overflowR,
                drawH
              );
              ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                0,
                drawY,
                overflowR,
                drawH
              );
            } else if (drawX < 0) {
              const overflowL = -drawX;
              ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                0,
                drawY,
                drawW - overflowL,
                drawH
              );
              ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                texCanvas.width - overflowL,
                drawY,
                overflowL,
                drawH
              );
            } else {
              ctx.drawImage(img, drawX, drawY, drawW, drawH);
            }

            ctx.fillText(
              titles[idx],
              rect.x + rect.width / 2,
              texCanvas.height * 0.5
            );
          }
        }
        texture.needsUpdate = true;
      }

      // === 滾動視差 ===
      function applyScrollParallax(p) {
        mesh.rotation.y = THREE.MathUtils.degToRad((p - 0.5) * 6);
        mesh.position.y = (p - 0.5) * 0.6;
      }

      // === 指標視差 ===
      let pointerX = 0,
        pointerY = 0;
      let pointerMoved = false;

      const onPointerMove = (e) => {
        pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
        pointerMoved = true;
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });

      function applyPointerParallax() {
        const targetX = -pointerY * 0.03;
        const targetY = pointerX * 0.05;
        mesh.rotation.x += (targetX - mesh.rotation.x) * 0.08;
        mesh.rotation.y += (targetY - mesh.rotation.y) * 0.08;
      }

      // === Lenis 平滑滾動 ===
      lenis = new Lenis({
        smoothWheel: true,
        smoothTouch: true,
        duration: 1.1,
        lerp: 0.08,
      });

      // 進度補間
      let currentP = sectionProgress();
      let targetP = currentP;
      let lastRenderedOffset = -999;

      // 初始畫面
      updateTexture(-currentP);
      applyScrollParallax(currentP);
      renderer.render(scene, camera);

      const SMOOTH_FACTOR = 0.15;
      const PROGRESS_EPS = 0.0008;

      function raf(time) {
        if (disposed) return;

        lenis.raf(time);

        const rawP = sectionProgress();
        targetP = rawP;

        const delta = targetP - currentP;
        if (Math.abs(delta) > PROGRESS_EPS) {
          currentP += delta * SMOOTH_FACTOR;
        }

        const offset = -currentP;
        if (Math.abs(offset - lastRenderedOffset) > PROGRESS_EPS) {
          updateTexture(offset);
          applyScrollParallax(currentP);
          renderer.render(scene, camera);
          lastRenderedOffset = offset;

          if (SHOW_DEBUG && progRef.current) {
            progRef.current.textContent = `progress: ${currentP.toFixed(3)}`;
          }
        }

        if (pointerMoved) {
          applyPointerParallax();
          renderer.render(scene, camera);
          pointerMoved = false;
        }

        updateFPS(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // === Resize ===
      const onResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);

          const p = sectionProgress();
          currentP = p;
          targetP = p;
          updateTexture(-p);
          applyScrollParallax(p);
          renderer.render(scene, camera);
          lastRenderedOffset = -p;
        }, 150);
      };

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        clearTimeout(resizeTimeout);
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
      };
    }

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy?.();
      sceneCleanup?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sliderSection bg-[#FBF8F5]"
      style={{ height: "320vh" }}
    >
      <div className="stickyWrap !bg-[#FBF8F5]">
        <canvas ref={canvasRef} />

        {/* ===== 上方文字區塊：照截圖排版 ===== */}
        <div className="title pointer-events-none mb-10 relative z-[10] mt-16 flex flex-col items-center justify-center px-4 text-center leading-none">
          {/* 中文大標 */}
          <p className="max-w-[980px] text-[18px] font-semibold tracking-[0.12em] text-[#111] md:text-[26px]">
            從山海到街角，拾起屬於這座島嶼的文化美學
          </p>

          {/* 超大 CULTURE */}
          <p className="mt-3 text-[64px] font-extrabold tracking-[0.18em] text-[#111] md:text-[96px]">
            CULTURE
          </p>

          {/* 說明文字 */}
          <p className="mt-4 max-w-[620px] text-[11px] leading-relaxed text-[#444] md:text-[12px]">
            從餐桌火鍋的湯底、庶民療癒的小點，到城市街巷中的日常煮歌——
            <br className="hidden md:block" />
            走進這些等你閱讀的店舖，不只是走入風景，而是走進生活本身
          </p>

          {/* 膠囊按鈕群 */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E5E9F2] px-1.5 py-1">
            <button className="pointer-events-auto rounded-full bg-[#0052FF] px-5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#003fd1]">
              HOME
            </button>
            <button className="pointer-events-auto rounded-full bg-transparent px-5 py-1.5 text-[11px] font-semibold text-[#0052FF] transition hover:text-[#003fd1]">
              PRODUCT
            </button>
          </div>
        </div>

        <div className="overlay" />

        {/* 你原本的 top/bottom bar，如不需要可以刪掉 */}
        <div className="topBar">
          <div className="siteInfo">
            <p className="logo">Codegrid</p>
            <p>YouTube Channel</p>
          </div>
          <div className="navLinks">
            <p>Index</p>
            <p>About</p>
          </div>
        </div>

        <div className="bottomBar">
          <p>Experiment 0410</p>
          <p>© 2024</p>
        </div>

        <div className="debug">
          <span ref={fpsRef}>FPS: -</span>
          <span ref={progRef} style={{ marginLeft: 12 }}>
            progress: -
          </span>
        </div>
      </div>

      <style jsx>{`
        .sliderSection {
          position: relative;
          width: 100%;
          background: #fbf8f5;
          color: #111;
        }
        .stickyWrap {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          top: 7%;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(251, 248, 245, 1) 0%,
            rgba(255, 255, 255, 0) 15%,
            rgba(255, 255, 255, 0) 85%,
            rgba(251, 248, 245, 1) 100%
          );
          pointer-events: none;
        }
        .topBar,
        .bottomBar {
          position: absolute;
          left: 0;
          right: 0;
          padding: 2em;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
          color: #111;
        }
        .topBar {
          top: 0;
        }
        .bottomBar {
          bottom: 0;
        }
        .siteInfo {
          display: grid;
          gap: 2px;
        }
        .navLinks {
          display: flex;
          gap: 2em;
        }
        .logo,
        .topBar p,
        .bottomBar p {
          font-size: 13px;
          font-weight: 400;
          opacity: 0.6;
        }
        .logo {
          opacity: 1;
        }
        .debug {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 3;
          font-size: 12px;
          opacity: 0.6;
          user-select: none;
          pointer-events: none;
          color: #111;
        }
      `}</style>
    </section>
  );
}
