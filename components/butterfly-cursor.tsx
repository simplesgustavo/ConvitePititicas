import { memo } from "react";

type ButterflyCursorProps = {
  size?: number;
  color?: string;
  accent?: string;
};

export const ButterflyCursor = memo(({ size = 32, color = "#f7a6ff", accent = "#ffe0ff" }: ButterflyCursorProps) => (
  <div
    className="pointer-events-none"
    style={{
      width: size,
      height: size,
      animation: "cursor-hover 1.6s ease-in-out infinite alternate",
      transformStyle: "preserve-3d",
      transform: "rotateX(50deg) rotateY(20deg) rotateZ(-45deg)",
    }}
  >
    <style jsx>{`
      @keyframes cursor-hover {
        0% {
          transform: rotateX(50deg) rotateY(20deg) rotateZ(-45deg) translateZ(0);
        }
        100% {
          transform: rotateX(50deg) rotateY(20deg) rotateZ(-45deg) translateZ(-3px);
        }
      }
      @keyframes cursor-flap-left {
        0% {
          transform: rotateY(-10deg);
        }
        100% {
          transform: rotateY(60deg);
        }
      }
      @keyframes cursor-flap-right {
        0% {
          transform: rotateY(180deg);
        }
        100% {
          transform: rotateY(100deg);
        }
      }
    `}</style>
    <div className="relative h-full w-full">
      <div
        className="absolute left-0 top-0 opacity-90"
        style={{
          animation: "cursor-flap-left 1.2s ease-in-out infinite alternate",
        }}
      >
        <Wing color={color} accent={accent} />
      </div>
      <div
        className="absolute right-0 top-0 opacity-90"
        style={{
          animation: "cursor-flap-right 1.2s ease-in-out infinite alternate",
        }}
      >
        <Wing color={color} accent={accent} mirrored />
      </div>
      <div className="absolute left-1/2 top-1/4 h-1/2 w-1 rounded-full bg-[#2a0e34]" />
    </div>
  </div>
));

ButterflyCursor.displayName = "ButterflyCursor";

const Wing = ({ color, accent, mirrored = false }: { color: string; accent: string; mirrored?: boolean }) => (
  <div
    className="relative"
    style={{
      width: 18,
      height: 20,
      transform: mirrored ? "scaleX(-1)" : "none",
    }}
  >
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        transform: "rotateZ(32deg)",
        background: color,
        boxShadow: "0 0 12px rgba(255, 255, 255, 0.4)",
      }}
    />
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        transform: "rotateZ(-36deg)",
        position: "absolute",
        top: -6,
        left: 2,
        background: accent,
        boxShadow: "0 0 8px rgba(255, 255, 255, 0.35)",
      }}
    />
  </div>
);
