import { LogOut, ShieldCheck } from "lucide-react";

function Navbar({ user, onLogout }) {
  return (
    <nav className="border-b border-slate-700/70 bg-[#12171a]/95 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/25 bg-[#1a3b45] text-cyan-200">
          <ShieldCheck size={20} />
        </div>
        <div><span className="block text-[15px] font-semibold tracking-tight text-slate-100">PR Sentinel</span><span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">Review workspace</span></div>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={user.avatarUrl}
          alt="GitHub avatar"
          className="h-8 w-8 rounded-full border border-slate-600 object-cover"
        />
        <span className="hidden text-sm text-slate-300 sm:block">{user.username}</span>
        <button
          onClick={onLogout}
          className="focus-ring rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          title="Logout"
        >
          <LogOut size={19} />
        </button>
      </div>
      </div>
    </nav>
  );
}

export default Navbar;
