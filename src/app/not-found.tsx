"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <Container className="py-20 flex flex-col items-center justify-center">
      <EmptyState
        title="Page Not Found (404)"
        description="The BeautyIQ route or resource you requested does not exist or has been relocated."
        icon={<Compass className="h-8 w-8 text-sage-deep" />}
        actionLabel="Return to Homepage"
        onAction={() => (window.location.href = "/")}
      />
    </Container>
  );
}
