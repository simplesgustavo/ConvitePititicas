import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const fallbackSecret = "sua_chave_longa_e_aleatoria_gerada_aqui";

const defaultLocalConfig = (
  adminUsername: string,
  adminPassword: string,
  adminName: string,
  mysqlPassword: string,
  mysqlDatabase: string,
  remoteHost: string,
  remotePort: string,
  remoteUser: string,
  remotePassword: string,
  remoteDatabase: string,
  remoteShadowDatabase: string,
) => {
  const clean = (value: string) => value.trim();
  const encodeCredential = (value: string) => encodeURIComponent(value);
  const username = clean(adminUsername) || "admin";
  const password = clean(adminPassword) || "confraRacha";
  const name = clean(adminName) || "Admin";
  const rootPassword = clean(mysqlPassword) || "local_password";
  const databaseName = clean(mysqlDatabase) || "gustavo40_dev";
  const remoteHostClean = clean(remoteHost) || "127.0.0.1";
  const remotePortClean = clean(remotePort) || "3306";
  const remoteUserClean = clean(remoteUser) || "root";
  const remotePasswordClean = clean(remotePassword) || rootPassword;
  const remoteDatabaseClean = clean(remoteDatabase) || databaseName;
  const remoteShadowDatabaseClean = clean(remoteShadowDatabase) || "nome_do_banco_shadow";

  const encodedLocalUser = encodeCredential("root");
  const encodedLocalPassword = encodeCredential(rootPassword);
  const encodedRemoteUser = encodeCredential(remoteUserClean);
  const encodedRemotePassword = encodeCredential(remotePasswordClean);

  return [
    "# --- Configuração para o Docker ---",
    `MYSQL_ROOT_PASSWORD=${rootPassword}`,
    "",
    "# Nome do banco de dados principal que o Docker criará.",
    `MYSQL_DATABASE_NAME=${databaseName}`,
    "",
    "# --- Configuração para o Prisma (LOCAL – Docker) ---",
    `DATABASE_URL="mysql://${encodedLocalUser}:${encodedLocalPassword}@127.0.0.1:3306/${databaseName}"`,
    `SHADOW_DATABASE_URL="mysql://${encodedLocalUser}:${encodedLocalPassword}@127.0.0.1:3306/${databaseName}_shadow"`,
    "",
    "# --- Configuração para o Prisma (SERVIDOR MYSQL REMOTO) ---",
    `# Ajuste o host, usuário e senhas conforme o provedor de hospedagem.`,
    `DATABASE_URL="mysql://${encodedRemoteUser}:${encodedRemotePassword}@${remoteHostClean}:${remotePortClean}/${remoteDatabaseClean}"`,
    `SHADOW_DATABASE_URL="mysql://${encodedRemoteUser}:${encodedRemotePassword}@${remoteHostClean}:${remotePortClean}/${remoteShadowDatabaseClean}"`,
    "",
    "# --- Configuração para o NextAuth.js ---",
    `NEXTAUTH_SECRET=${fallbackSecret}`,
    "NEXTAUTH_URL=http://localhost:3000",
    "",
    "# --- Admin padrão criado automaticamente no primeiro login ---",
    `DEFAULT_ADMIN_USERNAME=${username}`,
    `DEFAULT_ADMIN_PASSWORD=${password}`,
    `DEFAULT_ADMIN_NAME=${name}`,
  ].join("\n");
};

const LocalConfigPage = () => {
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("confraRacha");
  const [adminName, setAdminName] = useState("Admin");
  const [mysqlPassword, setMysqlPassword] = useState("local_password");
  const [mysqlDatabase, setMysqlDatabase] = useState("gustavo40_dev");
  const [remoteHost, setRemoteHost] = useState("127.0.0.1");
  const [remotePort, setRemotePort] = useState("3306");
  const [remoteUser, setRemoteUser] = useState("root");
  const [remotePasswordValue, setRemotePasswordValue] = useState("local_password");
  const [remoteDatabase, setRemoteDatabase] = useState("gustavo40_dev");
  const [remoteShadowDatabase, setRemoteShadowDatabase] = useState("nome_do_banco_shadow");
  const [feedback, setFeedback] = useState<string | null>(null);

  const configSnippet = useMemo(
    () =>
      defaultLocalConfig(
        adminUsername,
        adminPassword,
        adminName,
        mysqlPassword,
        mysqlDatabase,
        remoteHost,
        remotePort,
        remoteUser,
        remotePasswordValue,
        remoteDatabase,
        remoteShadowDatabase
      ),
    [
      adminName,
      adminPassword,
      adminUsername,
      mysqlDatabase,
      mysqlPassword,
      remoteDatabase,
      remoteHost,
      remotePasswordValue,
      remotePort,
      remoteShadowDatabase,
      remoteUser
    ]
  );

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setFeedback("Copie manualmente o bloco abaixo (navegador sem suporte ao clipboard).");
      return;
    }
    navigator.clipboard
      .writeText(configSnippet)
      .then(() => {
        setFeedback("Configuração copiada! Cole o conteúdo no seu arquivo .env.");
        setTimeout(() => setFeedback(null), 5000);
      })
      .catch(() => {
        setFeedback("Não foi possível copiar automaticamente. Copie manualmente o bloco abaixo.");
      });
  };

  return (
    <>
      <Head>
        <title>Configuração Local | Painel Administrativo</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-[#0f1b5b] via-[#46249f] to-[#7d3dd1] p-6 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <header className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <h1 className="text-3xl font-bold uppercase tracking-[0.2em] text-white drop-shadow-lg">
              Configuração Local
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/80">
              Personalize as variáveis de ambiente do arquivo <code>.env</code> para desenvolvimento local.
              No primeiro login, o sistema cria o administrador usando as credenciais definidas abaixo. Você pode
              alterar a senha posteriormente no painel em &quot;Segurança da conta&quot;.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] hover:border-white/60 hover:bg-white/25"
              >
                Início
              </Link>
              <Link
                href="/admin/login"
                className="rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] hover:border-white/60 hover:bg-white/25"
              >
                Ir para Login
              </Link>
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)]">
            <article className="rounded-3xl border border-white/20 bg-white/15 p-6 shadow-xl backdrop-blur-lg">
              <h2 className="text-xl font-semibold uppercase tracking-[0.18em] text-white">
                Ajustes do Admin
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Defina as credenciais padrão do administrador. O usuário é criado automaticamente no primeiro login
                usando essas informações.
              </p>
              <form className="mt-6 space-y-4 text-sm">
                <label className="flex flex-col gap-1 text-white/80">
                  Usuário do admin
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(event) => setAdminUsername(event.target.value)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="admin"
                  />
                </label>
                <label className="flex flex-col gap-1 text-white/80">
                  Senha do admin
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="confraRacha"
                  />
                </label>
                <label className="flex flex-col gap-1 text-white/80">
                  Nome a exibir
                  <input
                    type="text"
                    value={adminName}
                    onChange={(event) => setAdminName(event.target.value)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Admin"
                  />
                </label>
              </form>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold uppercase tracking-[0.16em] text-white">
                  Banco local (Docker)
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  Use as credenciais abaixo se for subir o MySQL via Docker/Compose.
                </p>
                <form className="mt-4 space-y-4 text-sm">
                  <label className="flex flex-col gap-1 text-white/80">
                    Senha do root
                    <input
                      type="text"
                      value={mysqlPassword}
                      onChange={(event) => setMysqlPassword(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="local_password"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/80">
                    Nome do banco
                    <input
                      type="text"
                      value={mysqlDatabase}
                      onChange={(event) => setMysqlDatabase(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="gustavo40_dev"
                    />
                  </label>
                </form>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold uppercase tracking-[0.16em] text-white">
                  Servidor MySQL remoto
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  Informe as credenciais fornecidas pelo provedor (Railway, Supabase, PlanetScale, etc).
                </p>
                <form className="mt-4 space-y-4 text-sm">
                  <label className="flex flex-col gap-1 text-white/80">
                    Host
                    <input
                      type="text"
                      value={remoteHost}
                      onChange={(event) => setRemoteHost(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="192.185.209.248"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/80">
                    Porta
                    <input
                      type="text"
                      value={remotePort}
                      onChange={(event) => setRemotePort(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="3306"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/80">
                    Usuário
                    <input
                      type="text"
                      value={remoteUser}
                      onChange={(event) => setRemoteUser(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="root"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/80">
                    Senha
                    <input
                      type="text"
                      value={remotePasswordValue}
                      onChange={(event) => setRemotePasswordValue(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="senha_do_provedor"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/80">
                    Banco principal
                    <input
                      type="text"
                      value={remoteDatabase}
                      onChange={(event) => setRemoteDatabase(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="nome_do_banco"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/80">
                    Shadow database
                    <input
                      type="text"
                      value={remoteShadowDatabase}
                      onChange={(event) => setRemoteShadowDatabase(event.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="nome_do_banco_shadow"
                    />
                  </label>
                </form>
              </div>
            </article>

            <article className="rounded-3xl border border-white/20 bg-black/30 p-6 shadow-2xl backdrop-blur-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold uppercase tracking-[0.18em] text-white">
                    Conteúdo para o .env
                  </h2>
                  <p className="mt-2 text-sm text-white/75">
                    Copie o bloco completo e cole no arquivo <code>.env.local</code> ou <code>.env</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:scale-[1.02] hover:border-white/60 hover:bg-white/25"
                >
                  Copiar
                </button>
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-sm leading-relaxed text-amber-200 shadow-inner">
                <code>{configSnippet}</code>
              </pre>
              {feedback && <p className="mt-4 text-sm text-emerald-200">{feedback}</p>}
            </article>
          </section>
        </div>
      </main>
    </>
  );
};

export default LocalConfigPage;
