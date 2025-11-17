export const SiteFooter = () => (
  <footer className="bg-neutral-950/90 text-white">
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">Gugale Solutions</p>
        <p className="mt-1 text-xs text-white/70">
          Solução desenvolvida pela Gugale Solutions, parceira em tecnologia e inovação digital sob medida para o seu evento.
        </p>
      </div>
      <p className="text-xs text-white/60 sm:text-right">© {new Date().getFullYear()} Gugale Solutions. Todos os direitos reservados.</p>
    </div>
  </footer>
);
