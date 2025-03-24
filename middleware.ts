import { authOptions } from "@/app/api/auth/[...nextauth]"
import withAuth from "next-auth/middleware"

export default withAuth({
  jwt: { decode: authOptions.jwt?.decode },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/login",
  }
})
export const config = {
  matcher: ["/dashboard"]
}
