export { auth as proxy } from "@/auth";
export const config = { matcher: ["/dashboard/:path*", "/session/:path*", "/leaderboard/:path*", "/profile/:path*", "/settings/:path*", "/owner/:path*", "/api/:path*"] };
