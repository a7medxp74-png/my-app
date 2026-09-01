import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
export default async function DashboardPage(){const s=await auth();if(!s)redirect('/login');return <DashboardClient/>}
