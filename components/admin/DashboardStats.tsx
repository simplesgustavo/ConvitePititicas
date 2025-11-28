import { DashboardStats as StatsType } from "@/lib/server/admin-dashboard";

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
    <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
      {value}
    </dd>
  </div>
);

type DashboardStatsProps = {
  stats: StatsType;
};

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statItems = [
    { title: "Pessoas convidadas (configuração)", value: stats.totalInvitedPeople },
    { title: "Pessoas confirmadas", value: stats.confirmedPeopleTotal },
    { title: "Confirmados 8+", value: stats.confirmedAbove8 },
    { title: "Confirmados 3-7", value: stats.confirmed3To7 },
    { title: "Convites pendentes", value: stats.pendingCount }
  ];

  const [primaryStat, ...secondaryStats] = statItems;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Resumo Geral</h3>
        <p className="text-sm text-gray-500">
          Visão rápida dos números que importam para o evento.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#6a3fb5] via-[#7f54e7] to-[#9c5dfd] px-5 py-6 text-white shadow-sm sm:p-6">
            <dt className="text-sm font-medium uppercase tracking-wide text-white/80">{primaryStat.title}</dt>
            <dd className="mt-3 text-4xl font-semibold text-white drop-shadow-[0_3px_12px_rgba(48,13,103,0.45)]">{primaryStat.value}</dd>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {secondaryStats.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} />
          ))}
        </div>
      </dl>
    </section>
  );
};
