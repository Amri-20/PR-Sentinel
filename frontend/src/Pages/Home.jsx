import { ShieldCheck } from "lucide-react";
import Github from "../Components/GithubIcon";

function Home({ error, onConnectGitHub }) {
  return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6"><div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center"><div className="bg-indigo-600 p-4 rounded-2xl inline-flex mb-6"><ShieldCheck size={35} /></div><h1 className="text-3xl font-bold mb-3">PR Sentinel</h1><p className="text-zinc-400 mb-8">AI-powered GitHub code review platform. Connect your GitHub account to get started.</p><button onClick={onConnectGitHub} className="w-full bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg py-3 flex items-center justify-center gap-3"><Github size={21} />Continue with GitHub</button>{error && <p className="text-red-400 text-sm mt-5">{error}</p>}</div></div>;
}

export default Home;
