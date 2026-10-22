import { LogOut, ShieldCheck } from "lucide-react";

function Navbar({ user, onLogout }) {
  return <nav className="border-b border-zinc-800 px-6 md:px-10 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-lg"><ShieldCheck size={22} /></div><span className="font-bold text-xl">PR Sentinel</span></div><div className="flex items-center gap-4"><img src={user.avatarUrl} alt="GitHub avatar" className="w-9 h-9 rounded-full" /><span className="text-sm hidden sm:block">{user.username}</span><button onClick={onLogout} className="text-zinc-400 hover:text-white" title="Logout"><LogOut size={19} /></button></div></nav>;
}

export default Navbar;
