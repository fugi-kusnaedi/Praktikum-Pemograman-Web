
"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function regiterAction(
    prevState: { error?: string } | undefined,
    formData: FormData
) {
    const name = formData.get("nama") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
        return { error: "Semua data harus diisi" }
    }

    if (password.length < 6) {
        return { error: "Password harus lebih dari 6 karakter" }
    }

    const existUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (existUser) {
        return {
            error: "Email sudah terdaftar!!! Silahkan gunakan email lain"
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword
        }
    })

    redirect("/login")
}

export async function loginAction(
    prevState: { error?: string } | undefined,
    formData: FormData
) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { error: "Email dan password harus diisi" }
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!user) {
        return {
            error: "Email belum terdaftar!!! Silahkan lakukan registrasi terlebih dahulu"
        }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return { error: "Email atau password salah" }
    }

    const sessionPayload = JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginAt: new Date().toISOString()
    })

    const cookieStore = await cookies()

    cookieStore.set("Praktikum_session", sessionPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/"
    })

    redirect("/dashboard")
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("Praktikum_session")
    redirect("/login")
}