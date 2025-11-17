import Head from "next/head";
import Link from "next/link";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Painel Administrativo | Sistema de Convites</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
        <div className="w-full max-w-lg rounded-lg bg-gray-800/50 p-8 text-center shadow-lg backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-amber-400">
            Painel Administrativo
          </h1>
          <p className="mt-2 text-xl text-gray-200">
            Sistema de Convite & RSVP
          </p>
          <p className="mt-4 text-gray-400">
            Bem-vindo ao sistema de gerenciamento de convites para o evento.
          </p>
          <p className="mt-4 text-gray-400">
            Uma solução Olso Sistemas, uma empresa Gugale Solutions.
          </p>

          <nav className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/admin/login"
              className="block rounded-md border border-white/20 bg-white/10 px-6 py-3 font-bold uppercase text-white transition-all hover:scale-105 hover:bg-white/20"
            >
              Acessar Painel
            </Link>
            {/* <Link
              href="/admin/local-config"
              className="block rounded-md border border-white/20 bg-white/5 px-6 py-3 font-bold uppercase text-white transition-all hover:scale-105 hover:bg-white/15"
            >
              Configurar Variáveis
            </Link> */}
          </nav>
        </div>
      </main>
    </>
  );
};

export default HomePage;
