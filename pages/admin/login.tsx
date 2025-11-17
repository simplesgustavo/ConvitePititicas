import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password
    });

    if (result?.error) {
      setError("Usuário ou senha inválidos.");
    } else {
      router.push("/admin"); // Redireciona para o painel após o login
    }
  };

  return (
    <>
      <Head>
        <title>Login | Painel Administrativo</title>
      </Head>
      <main className="relative flex h-screen w-screen items-center justify-center bg-gradient-to-br from-[#0f1b5b] via-[#46249f] to-[#7d3dd1]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-[#ff9a44]/35 blur-[120px]" aria-hidden="true" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#00c4ff]/30 blur-[140px]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[url('https://ia.olso.com.br/var/assets/img/gugaleolsobg.png')] bg-cover bg-center opacity-10 mix-blend-screen" aria-hidden="true" />
        </div>
        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-10 shadow-[0_40px_110px_-65px_rgba(15,20,41,0.75)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/15" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-28 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#ff8b5d]/70 to-[#ffd27d]/40 opacity-80 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#6a3fb5]/60 to-[#9c5dfd]/40 opacity-80 blur-[110px]" aria-hidden="true" />
          <h1 className="relative mb-6 text-center text-3xl font-bold uppercase tracking-[0.25em] text-white drop-shadow-[0_6px_18px_rgba(23,12,48,0.85)]">
            Login
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              className="rounded-xl border border-white/25 bg-white/10 p-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="rounded-xl border border-white/25 bg-white/10 p-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            {error && <p className="text-center text-red-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">{error}</p>}
            <button
              type="submit"
              className="mt-4 rounded-full border border-white/30 bg-white/15 py-3 font-bold uppercase tracking-[0.25em] text-white backdrop-blur-lg transition hover:scale-[1.02] hover:border-white/70 hover:bg-white/25 hover:shadow-[0_24px_45px_-25px_rgba(106,63,181,0.6)] focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
