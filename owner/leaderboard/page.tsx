"use client";
import { useEffect,useState } from "react";
export default function OwnerLeaderboard(){const [d,setD]=useState<any[]>([]);useEffect(()=>{fetch('/api/owner/leaderboard').then(r=>r.json()).then(setD)},[]);return <div className="container"><h1 className="title">Leaderboard Management</h1><div className="card pad" style={{marginTop:16}}><div className="list">{d.map((u,i)=><div className="row" key={u.id}><strong>#{i+1}</strong><span>{u.name||u.email}</span><span>{u.xp} XP · {u.points} نقطة</span></div>)}</div></div></div>}
