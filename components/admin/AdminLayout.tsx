"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import type { PropsWithChildren, ReactNode } from "react";
import { useMemo } from "react";

type AdminLayoutProps = PropsWithChildren<{
  title: string;
  description?: ReactNode;
}>;

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Visão Geral" },
  { href: "/admin/evento", label: "Evento & Aparência" },
  { href: "/admin/convidados", label: "Convidados" },
  { href: "/admin/seguranca", label: "Segurança" },
];

export const AdminLayout = ({ title, description, children }: AdminLayoutProps) => {
  const router = useRouter();
  const activeHref = router.pathname;

  const navigation = useMemo(
    () =>
      navItems.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-[#7c5dff] text-white shadow-md shadow-[#7c5dff]/30"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      }),
    [activeHref],
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
            {description ? <div className="mt-1 text-sm text-gray-500">{description}</div> : null}
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap gap-2">{navigation}</nav>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
};
