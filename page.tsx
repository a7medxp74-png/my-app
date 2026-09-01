import { redirect } from "next/navigation";
import { auth } from "@/auth";
export default async function Home(){const s=await auth();redirect(s?'/dashboard':'/login')}
