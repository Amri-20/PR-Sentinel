import { Loader2 } from "lucide-react";

function Loading({ message = "Loading PR Sentinel..." }) {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-6 text-slate-200">
      <div className="surface flex items-center gap-3 rounded-lg px-5 py-4 text-sm shadow-2xl shadow-black/10">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
        {message}
      </div>
    </div>
  );
}

export default Loading;
