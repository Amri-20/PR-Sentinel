import Loading from "../Components/Loading";
import useAuth from "../Hooks/useAuth";
import Dashboard from "./Dashboard";
import Home from "./Home";

function AppContent() {
  const { user, loading, error, connectGitHub } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Home error={error} onConnectGitHub={connectGitHub} />;
  return <Dashboard />;
}

export default AppContent;
