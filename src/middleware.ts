import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Allow demo pages without authentication
        if (pathname === "/rules/new" || 
            pathname === "/rules" ||
            pathname === "/transfers" ||
            pathname === "/settings" ||
            pathname === "/profile" ||
            pathname.startsWith("/rules/demo")) {
          return true;
        }
        
        // Protect sensitive dashboard routes that require authentication
        if (pathname.startsWith("/dashboard") || 
            pathname.startsWith("/rules/edit") ||
            pathname.startsWith("/transfers/send") ||
            pathname.startsWith("/account")) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rules/:path*", 
    "/transfers/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/account/:path*"
  ]
};