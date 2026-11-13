import { AuthProvider } from "./Context/AuthContext.jsx";
import AppContent from "./Pages/AppContent";

function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

export default App;
