import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NLang",
  description: "缩写查询与词条管理"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="header">
          <div className="container headerInner">
            <Link className="brand" href="/">
              NLang
            </Link>
            <nav className="nav">
              <Link href="/">查询</Link>
              <Link href="/admin">后台</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

