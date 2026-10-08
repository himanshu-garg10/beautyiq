import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["customer", "admin"]}>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container mx-auto flex flex-1 pt-[72px]">
          <CustomerSidebar className="hidden md:flex" />
          <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
