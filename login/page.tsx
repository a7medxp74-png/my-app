import { signIn } from "@/auth";

export default function LoginPage() {
  return <main className="login"><div className="card pad login-card"><div style={{display:"grid",placeItems:"center",gap:12,textAlign:"center"}}><div className="logo-large">C</div><h1 className="title">Commit</h1><p className="subtitle">ذاكر. أثبت التزامك. طوّر مستواك.</p><form action={async()=>{"use server";await signIn("google",{redirectTo:"/dashboard"})}} style={{width:"100%",marginTop:15}}><button className="btn btn-primary" style={{width:"100%"}}>تسجيل الدخول باستخدام Google</button></form><p className="tiny muted">بتسجيل الدخول، توافق على استخدام Commit لحسابك عبر Google.</p></div></div></main>;
}
