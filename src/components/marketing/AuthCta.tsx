"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

/** Marketing CTAs that switch to "Open dashboard" once the visitor is signed in. */
export function AuthCta({ variant }: { variant: "nav" | "hero" }) {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return (
      <Button asChild size={variant === "hero" ? "lg" : "sm"}>
        <Link href="/dashboard">
          Open dashboard <ArrowRight />
        </Link>
      </Button>
    );
  }

  if (variant === "nav") {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/register">Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild size="lg">
        <Link href="/auth/register">
          Start budgeting free <ArrowRight />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/auth/login">I have an account</Link>
      </Button>
    </div>
  );
}
