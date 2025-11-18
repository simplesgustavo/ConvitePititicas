import Head from "next/head";
import Link from "next/link";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Painel Jardim Encantado | Sistema de Convites</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#081b1c] via-[#162b2c] to-[#291733] p-4 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-[0_40px_80px_rgba(7,11,26,0.6)] backdrop-blur-xl">
          <h1 className="text-4xl font-bold text-[#a5ffde] drop-shadow-[0_8px_24px_rgba(30,86,72,0.6)]">
            Painel Jardim Encantado
          </h1>
          <p className="mt-2 text-xl text-[#fdd6f4]">
            Convite interativo & RSVP Pititicas
          </p>
          <p className="mt-4 text-[#d9fbe7]">
            Bem-vindo ao centro onde borboletas, mensagens e confirmações se encontram antes da grande festa.
          </p>
          <p className="mt-4 text-[#d3c3ff]">
            Administre o evento, personalize flores e acompanhe cada RSVP em tempo real.
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
