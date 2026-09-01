import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OwnerDashboard } from "@/components/owner-dashboard";
export default async function OwnerPage(){const s=await auth();if(!s)redirect('/login');if(s.user.role!=='OWNER'&&s.user.role!=='ADMIN')redirect('/dashboard');return <OwnerDashboard/>}
