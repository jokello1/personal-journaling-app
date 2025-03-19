import NextAuth, { NextAuthOptions } from "next-auth";
import {PrismaClient} from "@prisma/client";
import ClientCredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        ClientCredentialsProvider({
            name: "ClientCredentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user) {
                    return null;
                }
                const passwordValid = await bcrypt.compare(credentials.password, user.password);
                if (!passwordValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({session, token}){
            if(token) {
                session.user.id = token.id as string
            }
            return session
        },
        async jwt({token, user}) {
            if(user) {
                token.id = user.id
            }
            return token
        }
    },
    pages: {
        signIn: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};
