import type { DashboardAnalytics } from "@/lib/server/admin-dashboard";

const numberFormatter = new Intl.NumberFormat("pt-BR");

type AnalyticsHighlightsProps = {
  analytics: DashboardAnalytics;
};

export const AnalyticsHighlights = ({ analytics }: AnalyticsHighlightsProps) => {
  const cards = [
    {
      title: "Convites emitidos",
      value: analytics.totalInvites,
      subtitle: `${analytics.viewedInvites} visualizados · ${analytics.unopenedInvites} pendentes`,
    },
    {
      title: "Capacidade de acompanhantes",
      value: analytics.totalCompanionCapacity,
      subtitle: "Limite total permitido para acompanhantes",
    },
    {
      title: "Visualizações totais",
      value: analytics.totalViewCount,
      subtitle: analytics.totalViewCount === 1 ? "1 acesso registrado" : `${analytics.totalViewCount} acessos registrados`,
    },
    {
      title: "Convites visualizados",
      value: analytics.viewedInvites,
      subtitle:
        analytics.viewedInvites === analytics.totalInvites
          ? "Todos os convidados visualizaram"
          : `${analytics.totalInvites - analytics.viewedInvites} ainda não abriram`,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-2xl border border-[#ede7ff] bg-gradient-to-br from-white via-white to-[#f7f4ff] p-5 shadow-[0_32px_60px_-45px_rgba(124,93,255,0.55)]"
        >
          <h3 className="text-sm font-medium uppercase tracking-[0.28em] text-[#6a49f2]">{card.title}</h3>
          <p className="mt-2 text-3xl font-black tracking-tight text-[#1e144b]">
            {numberFormatter.format(card.value)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#9a8af5]">{card.subtitle}</p>
        </article>
      ))}
    </section>
  );
};

type ViewsTimelineChartProps = {
  data: DashboardAnalytics["timeline"];
};

export const ViewsTimelineChart = ({ data }: ViewsTimelineChartProps) => {
  const totalValues = data.map((item) => item.firstViews + item.additionalViews);
  const firstValues = data.map((item) => item.firstViews);
  const additionalValues = data.map((item) => item.additionalViews);
  const maxValue = Math.max(1, ...totalValues);

  const chartHeight = 260;
  const chartWidth = Math.max(720, data.length * 60);
  const paddingX = 48;
  const paddingY = 40;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const toPoints = (values: number[]) =>
    values.map((value, index) => {
      const x = paddingX + step * index;
      const y = paddingY + innerHeight * (1 - value / maxValue);
      return { x, y, value };
    });

  const makePath = (points: Array<{ x: number; y: number }>) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");

  const totalPoints = toPoints(totalValues);
  const firstPoints = toPoints(firstValues);
  const additionalPoints = toPoints(additionalValues);

  const gridLines = Array.from({ length: 4 }).map((_, index) => {
    const value = ((index + 1) / 4) * maxValue;
    const y = paddingY + innerHeight * (1 - (index + 1) / 4);
    return {
      value: Math.round(value),
      y,
    };
  });

  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#191135] via-[#211745] to-[#0f0b1f] p-6 text-white shadow-[0_35px_120px_-70px_rgba(124,93,255,0.9)]">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Engajamento do convite</h2>
          <p className="text-sm text-white/60">Primeiras visualizações, acessos adicionais e total diário (14 dias).</p>
        </div>
      </header>

      <div className="mt-6 overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="min-w-full"
        >
          <defs>
            <linearGradient id="totalLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c5dff" />
              <stop offset="100%" stopColor="#9f8fff" />
            </linearGradient>
            <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {gridLines.map((line) => (
            <g key={`grid-${line.value}`}>
              <line
                x1={paddingX}
                x2={paddingX + innerWidth}
                y1={line.y}
                y2={line.y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 6"
              />
              <text
                x={paddingX - 18}
                y={line.y + 4}
                fontSize={10}
                fill="rgba(255,255,255,0.45)"
                textAnchor="end"
              >
                {line.value}
              </text>
            </g>
          ))}

          {data.map((item, index) => {
            const x = paddingX + step * index;
            return (
              <line
                key={`divider-${item.date}`}
                x1={x}
                x2={x}
                y1={paddingY}
                y2={paddingY + innerHeight}
                stroke="rgba(255,255,255,0.04)"
              />
            );
          })}

          <path
            d={makePath(additionalPoints)}
            fill="none"
            stroke="#33c9a3"
            strokeWidth={2}
            strokeDasharray="6 6"
          />

          <path
            d={makePath(firstPoints)}
            fill="none"
            stroke="#ffbf75"
            strokeWidth={2}
            strokeDasharray="4 4"
          />

          <path
            d={makePath(totalPoints)}
            fill="none"
            stroke="url(#totalLineGradient)"
            strokeWidth={3}
          />

          {totalPoints.map((point) => (
            <g key={`total-${point.x}-${point.y}`}>
              <circle cx={point.x} cy={point.y} r={4.5} fill="#7c5dff" />
              <circle cx={point.x} cy={point.y} r={11} fill="url(#circleGlow)" opacity={0.28} />
            </g>
          ))}

          {firstPoints.map((point) => (
            <circle key={`first-${point.x}-${point.y}`} cx={point.x} cy={point.y} r={4} fill="#ffbf75" />
          ))}

          {additionalPoints.map((point) => (
            <circle key={`additional-${point.x}-${point.y}`} cx={point.x} cy={point.y} r={4} fill="#33c9a3" />
          ))}

          {data.map((item, index) => {
            const x = paddingX + step * index;
            return (
              <text
                key={`label-${item.date}`}
                x={x}
                y={chartHeight - 12}
                fontSize={11}
                fill="rgba(255,255,255,0.7)"
                textAnchor="middle"
              >
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>

      <footer className="mt-6 flex flex-wrap gap-4 text-xs text-white/70">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#ffbf75]" />
          Primeira visualização registrada
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#33c9a3]" />
          Visualizações adicionais
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#7c5dff]" />
          Total de acessos por dia
        </span>
      </footer>
    </section>
  );
};
