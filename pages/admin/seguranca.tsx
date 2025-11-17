import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

type SecurityPageProps = Record<string, never>;

const SegurancaPage: NextPage<SecurityPageProps> = () => (
  <>
    <Head>
      <title>Segurança | Painel Administrativo</title>
    </Head>
    <AdminLayout
      title="Segurança"
      description="Atualize a senha do painel e mantenha o acesso protegido."
    >
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="text-lg font-semibold text-gray-900">Boas práticas</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Compartilhe as credenciais apenas com pessoas autorizadas.</li>
          <li>Evite reutilizar senhas já utilizadas em outros sistemas.</li>
          <li>Atualize a senha periodicamente e logo após eventos importantes.</li>
        </ul>
      </div>
      <ChangePasswordForm />
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

  return {
    props: {
      session,
    },
  };
};

export default SegurancaPage;
