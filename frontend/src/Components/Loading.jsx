import { Loader2 } from "lucide-react";

function Loading({ message = "Loading PR Sentinel..." }) {
  return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center"><Loader2 className="animate-spin mr-3" />{message}</div>;
}

export default Loading;
