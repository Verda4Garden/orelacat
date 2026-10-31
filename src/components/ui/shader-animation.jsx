import { useEffect, useRef } from "react";
import * as THREE from "three";

/* Shader Animation — component adopted from 21st.dev.
   Concentric interference rings drawn in a fragment shader. Used here as
   the page's background field: it sits behind everything at low opacity,
   frozen when the visitor asks for reduced motion. */
export function ShaderAnimation({ speed = 0.05, opacity = 1, tint = [0.62, 0.58, 0.52] }) {
  const containerRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec3 tint;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        // The original increments the uniform by 0.05 per frame and scales it
        // by 0.05 again here. Folding that into the uniform (speed = 0.05/frame)
        // keeps exactly that pace; without this line the rings race.
        float t = time * 0.05;
        float lineWidth = 0.004;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / max(0.002, abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2)));
          }
        }
        // raise the faint bands into visibility, then clamp softly
        color = color * 1.9 - 0.12;
        color = clamp(color, 0.0, 1.0);

        gl_FragColor = vec4(color * tint, 1.0);
      }
    `;

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
      tint: { value: new THREE.Vector3(...tint) },
    };

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    scene.add(new THREE.Mesh(geometry, material));

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };
    resize();
    window.addEventListener("resize", resize, false);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(container);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!reduce) uniforms.time.value += speed;
      renderer.render(scene, camera);
      if (stateRef.current) stateRef.current.animationId = raf;
    };

    stateRef.current = { renderer, geometry, material, animationId: 0 };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      ro?.disconnect();
      cancelAnimationFrame(raf);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [speed, tint[0], tint[1], tint[2]]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none", overflow: "hidden" }}
    />
  );
}

export default ShaderAnimation;
