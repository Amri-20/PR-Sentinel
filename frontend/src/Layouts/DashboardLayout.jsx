import Navbar from "../Components/Navbar";

function DashboardLayout({ user, onLogout, children }) {
  return (
    <div className="app-shell min-h-screen text-slate-100">
      <Navbar user={user} onLogout={onLogout} />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">{children}</main>
    </div>
  );
}

export default DashboardLayout;
