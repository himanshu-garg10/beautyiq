import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PublicPageBar } from "@/components/layout/public-page-bar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PublicPageBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
