import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z as zod } from "zod"
import prisma from "@/lib/prisma";

const registerSchema = zod.object({
    name: zod.string().min(3).max(50),
    email: zod.string().email(),
    password: zod.string().min(8).max(13),
    role: zod.string().min(3).max(50)
});

export async function POST(request: Request) {
    try{
        const body = await request.json()
        const {name, email, password} = registerSchema.parse(body)
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if(existingUser) {
            return new Response("User already exists", { status: 400 })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({ 
            data: {
                name,
                email,
                password: hashedPassword,
                settings: {
                    create: {
                        darkMode: false,
                        emailNotifications: true
                    }
                },
                categories: {
                    create: [
                        { name: 'Personal', color: '#4f46e5' },
                        { name: 'Work', color: '#10b981' },
                        { name: 'Travel', color: '#f59e0b' },
                    ]
                }
            }
        })
        return NextResponse.json(
            {id: user.id, email: user.email, name: user.name }
            , { status: 201 })
    } catch (error) {
        if(error instanceof zod.ZodError) {
            return  NextResponse.json({error: error.errors}, { status: 400 })
        }
        return NextResponse.json({error: "Invalid request body"}, { status: 500 })
    }
}