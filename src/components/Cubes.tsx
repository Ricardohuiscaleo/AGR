import React, { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import "./Cubes.css";

interface Gap {
  row: number;
  col: number;
}
interface Duration {
  enter: number;
  leave: number;
}

export interface CubesProps {
  gridSize?: number;
  cubeSize?: number;
  maxAngle?: number;
  radius?: number;
  easing?: gsap.EaseString;
  duration?: Duration;
  cellGap?: number | Gap;
  borderStyle?: string;
  faceColor?: string;
  shadow?: boolean | string;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  rippleColor?: string;
  rippleSpeed?: number;
}

const Cubes: React.FC<CubesProps> = ({
  gridSize = 8,
  cubeSize,
  maxAngle = 60,
  radius = 4,
  easing = "power3.out",
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = "2px dashed #5227FF",
  faceColor = "#1a1a2e",
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = "#ff6b6b",
  rippleSpeed = 1.5,
}) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const simTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);

  const colGap =
    typeof cellGap === "number"
      ? `${cellGap}px`
      : (cellGap as Gap)?.col !== undefined
        ? `${(cellGap as Gap).col}px`
        : "5%";
  const rowGap =
    typeof cellGap === "number"
      ? `${cellGap}px`
      : (cellGap as Gap)?.row !== undefined
        ? `${(cellGap as Gap).row}px`
        : "5%";

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      if (!sceneRef.current) return;
      sceneRef.current
        .querySelectorAll<HTMLDivElement>(".cube")
        .forEach((cube) => {
          const r = +cube.dataset.row!;
          const c = +cube.dataset.col!;
          const dist = Math.hypot(r - rowCenter, c - colCenter);
          if (dist <= radius) {
            const pct = 1 - dist / radius;
            const angle = pct * maxAngle;
            gsap.to(cube, {
              duration: enterDur,
              ease: easing,
              overwrite: true,
              rotateX: -angle,
              rotateY: angle,
            });
          } else {
            gsap.to(cube, {
              duration: leaveDur,
              ease: "power3.out",
              overwrite: true,
              rotateX: 0,
              rotateY: 0,
            });
          }
        });
    },
    [radius, maxAngle, enterDur, leaveDur, easing]
  );

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const rect = sceneRef.current!.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colCenter = (clientX - rect.left) / cellW;
      const rowCenter = (clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() =>
        tiltAt(rowCenter, colCenter)
      );

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      e.stopPropagation();
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    },
    []
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || !touchStartRef.current) return;
      
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Si es un gesto vertical rápido (scroll), no prevenir el comportamiento por defecto
      if (deltaY > deltaX && deltaY > 10 && deltaTime < 300) {
        return; // Permitir scroll
      }
      
      // Si es interacción con cubos (tap o movimiento horizontal)
      if (deltaTime > 100 || deltaX > deltaY) {
        e.preventDefault();
        e.stopPropagation();
        handleInteraction(touch.clientX, touch.clientY);
      }
    },
    [handleInteraction]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll<HTMLDivElement>(".cube").forEach((cube) =>
      gsap.to(cube, {
        duration: leaveDur,
        rotateX: 0,
        rotateY: 0,
        ease: "power3.out",
      })
    );
  }, [leaveDur]);

  const handleClick = useCallback(
    (clientX: number, clientY: number) => {
      if (!rippleOnClick || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings: Record<number, HTMLDivElement[]> = {};
      sceneRef.current
        .querySelectorAll<HTMLDivElement>(".cube")
        .forEach((cube) => {
          const r = +cube.dataset.row!;
          const c = +cube.dataset.col!;
          const dist = Math.hypot(r - rowHit, c - colHit);
          const ring = Math.round(dist);
          if (!rings[ring]) rings[ring] = [];
          rings[ring].push(cube);
        });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) =>
            Array.from(cube.querySelectorAll<HTMLElement>(".cube-face"))
          );

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: "power3.out",
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: "power3.out",
          });
        });
    },
    [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed]
  );

  const onClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleClick(e.clientX, e.clientY);
    },
    [handleClick]
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Si es un tap (poco movimiento y tiempo corto), activar efecto ripple
      if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
        e.preventDefault();
        e.stopPropagation();
        handleClick(touch.clientX, touch.clientY);
      }
      
      touchStartRef.current = null;
    },
    [handleClick]
  );

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;
    simPosRef.current = {
      x: Math.random() * gridSize,
      y: Math.random() * gridSize,
    };
    simTargetRef.current = {
      x: Math.random() * gridSize,
      y: Math.random() * gridSize,
    };
    const speed = 0.02;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = {
            x: Math.random() * gridSize,
            y: Math.random() * gridSize,
          };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      if (simRAFRef.current != null) {
        cancelAnimationFrame(simRAFRef.current);
      }
    };
  }, [autoAnimate, gridSize, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    
    // Desktop events
    el.addEventListener("mousemove", onMouseMove, { passive: false });
    el.addEventListener("mouseleave", resetAll);
    el.addEventListener("click", onClick, { passive: false });
    
    // Mobile events
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    
    // Pointer events (fallback)
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerleave", resetAll);
    
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", resetAll);
      el.removeEventListener("click", onClick);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", resetAll);
      rafRef.current != null && cancelAnimationFrame(rafRef.current);
      idleTimerRef.current && clearTimeout(idleTimerRef.current);
    };
  }, [onMouseMove, onTouchStart, onTouchMove, onTouchEnd, onPointerMove, resetAll, onClick]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle: React.CSSProperties = {
    gridTemplateColumns: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap: rowGap,
  };
  const wrapperStyle = {
    "--cube-face-border": borderStyle,
    "--cube-face-bg": faceColor,
    "--cube-face-shadow":
      shadow === true ? "0 0 6px rgba(0,0,0,.5)" : shadow || "none",
    ...(cubeSize
      ? {
          width: `${gridSize * cubeSize}px`,
          height: `${gridSize * cubeSize}px`,
        }
      : {}),
  } as React.CSSProperties;

  return (
    <div className="cubes-animation" style={wrapperStyle}>
      <div className="cubes-dynamic-bg"></div>
      <div
        ref={sceneRef}
        className="cubes-animation--scene"
        style={sceneStyle}
      >
        {cells.map((_, r) =>
          cells.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}>
              <div className="cube-face cube-face--top" />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left" />
              <div className="cube-face cube-face--right" />
              <div className="cube-face cube-face--front" />
              <div className="cube-face cube-face--back" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cubes;

// Agregar estilos dinámicos al montar el componente
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cubesGradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes cubesColorCycle {
      0% { filter: hue-rotate(0deg); }
      25% { filter: hue-rotate(90deg); }
      50% { filter: hue-rotate(180deg); }
      75% { filter: hue-rotate(270deg); }
      100% { filter: hue-rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}