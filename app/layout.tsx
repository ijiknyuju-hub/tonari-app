import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "となりごはん",
  description: "料理のバリエーションと隣の料理を系統図で育てるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
