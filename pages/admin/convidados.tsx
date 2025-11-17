import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import {
  getAdminDashboardData,
  GuestWithRsvp,
  EventAppearanceSettings
} from "@/lib/server/admin-dashboard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminActions } from "@/components/admin/AdminActions";
import { GuestListTable } from "@/components/admin/GuestListTable";

type GuestsPageProps = {
  guests: GuestWithRsvp[];
  appearance: EventAppearanceSettings | null;
};

const ConvidadosPage: NextPage<GuestsPageProps> = ({ guests, appearance }) => (
  <>
    <Head>
      <title>Convidados | Painel Administrativo</title>
    </Head>
    <AdminLayout
      title="Convidados"
      description="Gerencie cadastros, convites e respostas de presença."
    >
      <AdminActions />
      <GuestListTable guests={guests} eventName={appearance?.name ?? "nosso evento"} />
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

  const { guests, appearance } = await getAdminDashboardData();
  const serializedAppearance = appearance ? JSON.parse(JSON.stringify(appearance)) : null;

  return {
    props: {
      session,
      guests: JSON.parse(JSON.stringify(guests)),
      appearance: serializedAppearance as EventAppearanceSettings | null,
    },
  };
};

export default ConvidadosPage;
