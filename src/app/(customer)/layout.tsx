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
        <div className="flex flex-1 container mx-auto">
          <CustomerSidebar className="hidden md:flex" />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
