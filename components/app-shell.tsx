import Link from "next/link";
import { Home, Trophy, UserRound, Settings, ShieldCheck, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import type { Session } from "next-auth";

export function AppShell({ children, session }: { children: React.ReactNode; session: Session | null }) {
  if (!session) return <>{children}</>;
  const owner = session.user.role === "OWNER" || session.user.role === "ADMIN";
  return <div className="app"><header className="topbar"><div className="container topbar-inner"><Link href="/dashboard" className="brand"><span className="brand-mark">C</span>Commit</Link><nav className="desktop-nav desktop-only"><Link href="/dashboard">الرئيسية</Link><Link href="/leaderboard">المتصدرون</Link><Link href="/profile">الملف</Link><Link href="/settings">الإعدادات</Link>{owner&&<Link href="/owner">المالك</Link>}</nav><div className="desktop-only" style={{alignItems:"center",gap:8}}>{session.user.image&&<img className="avatar" src={session.user.image} alt=""/>}<span className="tiny">{session.user.name}</span><form action={async()=>{'use server';await signOut({redirectTo:'/login'})}}><button className="btn btn-ghost" type="submit">خروج</button></form></div></div></header><main className="page">{children}</main><nav className="bottom-nav"><Link className="nav-item" href="/dashboard"><Home size={20}/>الرئيسية</Link><Link className="nav-item" href="/leaderboard"><Trophy size={20}/>المتصدرون</Link><Link className="nav-item" href="/profile"><UserRound size={20}/>الملف</Link><Link className="nav-item" href={owner?"/owner":"/settings"}>{owner?<ShieldCheck size={20}/>:<Settings size={20}/>} {owner?"المالك":"الإعدادات"}</Link></nav></div>;
}
