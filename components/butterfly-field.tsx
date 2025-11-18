import { CSSProperties, memo } from "react";

type Butterfly = {
  top: string;
  left: string;
  scale: number;
  direction: "left" | "right";
  delay: number;
  color: string;
  distance: number;
  lift: number;
  duration: number;
  drift: number;
};

const BUTTERFLIES: Butterfly[] = [
  { top: "14%", left: "3%", scale: 0.85, direction: "right", delay: 0, color: "#d962ff", distance: 1100, lift: 210, duration: 34, drift: 28 },
  { top: "28%", left: "5%", scale: 0.6, direction: "right", delay: 2.1, color: "#5fd2ff", distance: 1000, lift: 180, duration: 29, drift: 24 },
  { top: "58%", left: "8%", scale: 1.05, direction: "right", delay: 4.8, color: "#ffb36b", distance: 1200, lift: 230, duration: 32, drift: 32 },
  { top: "80%", left: "6%", scale: 0.7, direction: "right", delay: 1.6, color: "#8ff7d1", distance: 1050, lift: 190, duration: 30, drift: 18 },
  { top: "20%", left: "94%", scale: 0.65, direction: "left", delay: 3.2, color: "#f8a5ff", distance: 1100, lift: 200, duration: 31, drift: 26 },
  { top: "42%", left: "96%", scale: 0.55, direction: "left", delay: 5.4, color: "#ffd966", distance: 1000, lift: 170, duration: 27, drift: 22 },
  { top: "66%", left: "98%", scale: 0.95, direction: "left", delay: 0.9, color: "#a4ffcc", distance: 1200, lift: 215, duration: 33, drift: 34 },
  { top: "76%", left: "92%", scale: 0.75, direction: "left", delay: 6, color: "#9ec5ff", distance: 1050, lift: 205, duration: 35, drift: 20 },
];

const lighten = (hexColor: string, amount: number) => {
  const hex = hexColor.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.round(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * amount));
  const b = Math.min(255, Math.round((num & 0x0000ff) + (255 - (num & 0x0000ff)) * amount));
  return `rgb(${r}, ${g}, ${b})`;
};

type ButterflyStyle = CSSProperties & {
  "--wing-color"?: string;
  "--sub-wing-color"?: string;
  "--butterfly-size"?: string;
  "--butterfly-scale"?: string;
};

export const ButterflyField = memo(() => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <style jsx>{`
      @keyframes hover {
        0% {
          transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateZ(0px);
        }

        100% {
          transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateZ(-3px);
        }
      }

      @keyframes shadow {
        0% {
          transform: translateX(-40px) translateY(100px) scale(1, 1);
        }

        100% {
          transform: translateX(-40px) translateY(100px) scale(1.1, 1.1);
        }
      }

      @keyframes leftflap {
        0% {
          transform: rotateY(-20deg);
        }

        100% {
          transform: rotateY(90deg);
        }
      }

      @keyframes rightflap {
        0% {
          transform: rotateY(200deg);
        }

        100% {
          transform: rotateY(90deg);
        }
      }

      @keyframes glide {
        0% {
          transform: translate3d(var(--from-x, -140px), var(--from-y, 60px), 0);
          opacity: 0;
        }
        15% {
          opacity: 0.85;
        }
        55% {
          opacity: 0.95;
        }
        100% {
          transform: translate3d(var(--to-x, 220px), var(--to-y, -140px), 0);
          opacity: 0;
        }
      }

      .butterfly-orbit {
        position: absolute;
        transform-style: preserve-3d;
        perspective: 900px;
        perspective-origin: 50% 50%;
        animation-name: glide;
        animation-duration: var(--orbit-duration, 28s);
        animation-delay: var(--orbit-delay, 0s);
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
      }

      .butterfly {
        animation: hover 1.6s cubic-bezier(0.48, 0.01, 0.54, 1) infinite alternate;
        position: relative;
        transform-style: preserve-3d;
        width: var(--butterfly-size, 30px);
        height: var(--butterfly-size, 30px);
        will-change: transform;
      }

      .butterfly--right {
        transform: scale(var(--butterfly-scale, 1)) rotateX(50deg) rotateY(20deg) rotateZ(-50deg);
      }

      .butterfly--left {
        transform: scale(var(--butterfly-scale, 1)) rotateX(50deg) rotateY(-20deg) rotateZ(50deg);
      }

      .butterfly::before {
        background: #715f30;
        border-radius: 50%;
        content: "";
        display: block;
        height: 110px;
        left: 50%;
        margin-left: -10px;
        position: absolute;
        top: -15px;
        transform: rotateY(100deg);
        width: 20px;
        z-index: 2;
      }

      .shadow {
        animation: shadow 250ms cubic-bezier(0.48, 0.01, 0.54, 1) infinite alternate reverse;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 50%;
        height: 10px;
        opacity: 0.12;
        transform-origin: 50% 50%;
        transform: translateX(-40px) translateY(100px);
        width: 100px;
      }

      .wing {
        position: absolute;
        top: 0;
        opacity: 0.8;
      }

      .wing:first-child {
        animation: leftflap 1.4s cubic-bezier(0.48, 0.01, 0.54, 1) infinite alternate;
        left: 0;
        transform: rotateY(-20deg);
        transform-origin: 700% 50%;
        will-change: transform;
      }

      .wing:last-child {
        animation: rightflap 1.4s cubic-bezier(0.48, 0.01, 0.54, 1) infinite alternate;
        right: 0;
        transform: rotateY(200deg);
        z-index: 1;
        will-change: transform;
      }

      .bit,
      .bit::after {
        border-radius: 50%;
        overflow: hidden;
        position: absolute;
        right: 0;
        top: 0;
        transform-origin: 100% 50%;
        background: var(--wing-color, #8ac6ff);
      }

      .bit::after {
        background: var(--sub-wing-color, #c6e6ff);
      }

      .bit:first-child {
        height: 70px;
        text-align: center;
        top: 15px;
        transform: rotateZ(40deg);
        width: 130px;
      }

      .bit:first-child::after {
        content: "";
        display: inline-block;
        height: 60px;
        left: -30px;
        top: 5px;
        width: 100px;
      }

      .bit:last-child {
        height: 55px;
        transform: rotateZ(-40deg);
        width: 100px;
      }

      .bit:last-child::after {
        content: "";
        display: inline-block;
        height: 45px;
        left: -24px;
        top: 5px;
        width: 60px;
        z-index: 1;
      }
    `}</style>
    {BUTTERFLIES.map((butterfly, index) => {
      const base = butterfly.color;
      const sub = lighten(base, 0.15);
      const isLeft = butterfly.direction === "left";
      const clampedScale = Math.min(Math.max(butterfly.scale, 0.4), 1.2);
      const size = Math.max(10, Math.min(30, 10 + clampedScale * 20));
      const butterflyStyle: ButterflyStyle = {
        "--wing-color": base,
        "--sub-wing-color": sub,
        "--butterfly-size": `${size}px`,
        "--butterfly-scale": `${clampedScale}`,
      };
      const horizontalRange = butterfly.distance;
      const fromX = isLeft ? horizontalRange : -horizontalRange;
      const toX = -fromX;
      const orbitStyle: CSSProperties = {
        top: butterfly.top,
        left: butterfly.left,
        ["--orbit-delay" as "--orbit-delay"]: `${butterfly.delay}s`,
        ["--orbit-duration" as "--orbit-duration"]: `${butterfly.duration}s`,
        ["--from-x" as "--from-x"]: `${fromX}px`,
        ["--to-x" as "--to-x"]: `${toX}px`,
        ["--from-y" as "--from-y"]: `${butterfly.drift}px`,
        ["--to-y" as "--to-y"]: `-${butterfly.lift}px`,
      };

      return (
        <div key={index} className="butterfly-orbit" style={orbitStyle}>
          <div className={`butterfly ${isLeft ? "butterfly--left" : "butterfly--right"}`} style={butterflyStyle}>
            <div className="wing">
              <div className="bit" />
              <div className="bit" />
            </div>
            <div className="wing">
              <div className="bit" />
              <div className="bit" />
            </div>
          </div>
          <span className="shadow" />
        </div>
      );
    })}
  </div>
));

ButterflyField.displayName = "ButterflyField";
