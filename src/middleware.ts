import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard") || 
            req.nextUrl.pathname.startsWith("/rules") ||
            req.nextUrl.pathname.startsWith("/transfers") ||
            req.nextUrl.pathname.startsWith("/settings")) {
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
    "/settings/:path*"
  ]
};