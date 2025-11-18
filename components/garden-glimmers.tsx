type Glimmer = {
  top: string;
  left: string;
  delay: number;
  size: number;
  hue: number;
};

const GLIMMERS: Glimmer[] = [
  { top: "10%", left: "25%", delay: 0, size: 140, hue: 280 },
  { top: "35%", left: "70%", delay: 3, size: 120, hue: 150 },
  { top: "65%", left: "15%", delay: 1.5, size: 160, hue: 40 },
  { top: "80%", left: "60%", delay: 2.2, size: 130, hue: 200 },
  { top: "20%", left: "85%", delay: 4, size: 150, hue: 320 }
];

export const GardenGlimmers = () => (
  <div className="pointer-events-none absolute inset-0">
    <style jsx>{`
      @keyframes pulseGlow {
        0% {
          opacity: 0.1;
          transform: scale(0.8);
        }
        50% {
          opacity: 0.45;
          transform: scale(1.05);
        }
        100% {
          opacity: 0.1;
          transform: scale(0.9);
        }
      }
    `}</style>
    {GLIMMERS.map((glimmer, index) => (
      <div
        key={index}
        className="absolute rounded-full blur-3xl"
        style={{
          top: glimmer.top,
          left: glimmer.left,
          width: glimmer.size,
          height: glimmer.size,
          background: `radial-gradient(circle, hsla(${glimmer.hue}, 90%, 80%, 0.6), transparent 60%)`,
          animation: "pulseGlow 6s ease-in-out infinite",
          animationDelay: `${glimmer.delay}s`
        }}
      />
    ))}
  </div>
);
