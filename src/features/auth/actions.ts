"use server";

import { createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    await createSession();
    redirect("/admin/personeller");
  } else {
    return { error: "Kullanıcı adı veya şifre hatalı!" };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}