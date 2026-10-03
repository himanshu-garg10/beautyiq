import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  const email = session?.user?.email;
  const name = session?.user?.name;
  if (!id || !email) {
    return null;
  }
  return { id, email, name: name || "" };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      },
    },
    { status: 401 }
  );
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null as SessionUser | null, response: unauthorizedResponse() };
  }
  return { user, response: null };
}
