import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import {
  EventAppearanceSettings,
  getAdminDashboardData
} from "@/lib/server/admin-dashboard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EventDetailsForm } from "@/components/admin/EventDetailsForm";
import { InviteAppearanceForm } from "@/components/admin/InviteAppearanceForm";

type EventPageProps = {
  appearance: EventAppearanceSettings | null;
};

const EventoPage: NextPage<EventPageProps> = ({ appearance }) => (
  <>
    <Head>
      <title>Evento & Aparência | Painel Administrativo</title>
    </Head>
    <AdminLayout
      title="Evento & Aparência"
      description="Atualize as informações principais do convite e a identidade visual."
    >
      <EventDetailsForm event={appearance} />
      <InviteAppearanceForm appearance={appearance} />
    </AdminLayout>
  </>
);

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

  const { appearance } = await getAdminDashboardData();
  const serializedAppearance = appearance ? JSON.parse(JSON.stringify(appearance)) : null;

  return {
    props: {
      session,
      appearance: serializedAppearance as EventAppearanceSettings | null,
    },
  };
};

export default EventoPage;
