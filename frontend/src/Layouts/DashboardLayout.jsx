import Navbar from "../Components/Navbar";

function DashboardLayout({ user, onLogout, children }) {
  return <div className="min-h-screen bg-zinc-950 text-white"><Navbar user={user} onLogout={onLogout} /><main className="max-w-7xl mx-auto px-6 md:px-10 py-10">{children}</main></div>;
}

export default DashboardLayout;
