import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // ✅ Public routes — no auth required
  if (
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/unauthorized") ||
    path.startsWith("/api")
  ) {
    return res;
  }

  // 🚫 Redirect to login if not logged in
  if (!user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/DASESLanding";
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Fetch user role from users table
  const { data: roleData, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleError || !roleData) {
    console.error("Role lookup failed:", roleError);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/unauthorized";
    return NextResponse.redirect(redirectUrl);
  }

  const role = roleData.role;

  // ✅ Role-based gating
  if (path.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (path.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (path.startsWith("/admin") && role !== "superadmin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
}

// ✅ Apply to relevant routes
export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/admin/:path*"],
};
