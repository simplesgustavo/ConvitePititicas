import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  getAdminDashboardData,
  GuestWithRsvp,
  DashboardStats as StatsType,
  EventAppearanceSettings,
  DashboardAnalytics
} from "@/lib/server/admin-dashboard";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsHighlights, ViewsTimelineChart } from "@/components/admin/AnalyticsHighlights";

type AdminDashboardProps = {
  guests: GuestWithRsvp[];
  stats: StatsType;
  appearance: EventAppearanceSettings | null;
  analytics: DashboardAnalytics;
};

const AdminDashboard: NextPage<AdminDashboardProps> = ({ guests, stats, appearance, analytics }) => {
  const upcomingGuests = guests.slice(0, 5);

  return (
    <>
      <Head>
        <title>Dashboard | Painel Administrativo</title>
      </Head>
      <AdminLayout
        title="Dashboard"
        description="Visão geral do evento, confirmações e engajamento do convite."
      >
        <DashboardStats stats={stats} />
        <AnalyticsHighlights analytics={analytics} />
        <ViewsTimelineChart data={analytics.timeline} />

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Evento</h2>
                <p className="text-sm text-gray-500">Informações essenciais do convite.</p>
              </div>
              <Link
                href="/admin/evento"
                className="text-sm font-medium text-[#7c5dff] hover:text-[#6a49f2]"
              >
                Gerenciar
              </Link>
            </header>
            <dl className="mt-4 space-y-2 text-sm text-gray-700">
              <div>
                <dt className="font-medium text-gray-500">Título</dt>
                <dd>{appearance?.name ?? "Defina o nome do evento"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Subtítulo</dt>
                <dd>{appearance?.subtitle ?? "Adicione um subtítulo"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Quando</dt>
                <dd>{appearance?.customDateLabel ?? "Atualize a data personalizada"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Local</dt>
                <dd>{appearance?.venue ?? "Informe o local do evento"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Segurança</h2>
                <p className="text-sm text-gray-500">Mantenha o acesso protegido.</p>
              </div>
              <Link
                href="/admin/seguranca"
                className="text-sm font-medium text-[#7c5dff] hover:text-[#6a49f2]"
              >
                Alterar senha
              </Link>
            </header>
            <p className="mt-4 text-sm text-gray-700">
              Altere periodicamente a senha do painel e compartilhe as credenciais com segurança.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              A seção de segurança também registra logs administrativos e ações críticas.
            </p>
          </article>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Convidados recentes</h2>
              <p className="text-sm text-gray-500">Últimos convidados cadastrados ou atualizados.</p>
            </div>
            <Link
              href="/admin/convidados"
              className="text-sm font-medium text-[#7c5dff] hover:text-[#6a49f2]"
            >
              Ver todos
            </Link>
          </header>
          <ul className="mt-4 divide-y divide-gray-200">
            {upcomingGuests.length === 0 ? (
              <li className="py-4 text-sm text-gray-500">Cadastre seus primeiros convidados para liberar o convite.</li>
            ) : (
              upcomingGuests.map((guest) => (
                <li key={guest.id} className="flex items-center justify-between py-3 text-sm text-gray-700">
                  <div>
                    <p className="font-medium text-gray-900">{guest.fullName}</p>
                    <p className="text-xs text-gray-500">{guest.phone}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {guest.invite?.rsvp?.status === "yes"
                      ? "Confirmado"
                      : guest.invite?.rsvp?.status === "no"
                        ? "Recusado"
                        : "Pendente"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </AdminLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { getSession } = await import("next-auth/react");
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  const { guests, stats, appearance, analytics } = await getAdminDashboardData();
  const serializedAppearance = appearance ? JSON.parse(JSON.stringify(appearance)) : null;
  const serializedAnalytics = JSON.parse(JSON.stringify(analytics));

  return {
    props: {
      session,
      guests: JSON.parse(JSON.stringify(guests)),
      stats,
      appearance: serializedAppearance as EventAppearanceSettings | null,
      analytics: serializedAnalytics as DashboardAnalytics
    },
  };
};

export default AdminDashboard;
