
import { useEffect, useState } from "react";
import {
    Github,
    ShieldCheck,
    GitPullRequest,
    Activity,
    Code2,
    CheckCircle2,
    CircleAlert
} from "lucide-react";

import api from "./services/api";

function App() {
    const [serverStatus, setServerStatus] = useState("checking");
    const [databaseStatus, setDatabaseStatus] = useState("checking");

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await api.get("/health");

                setServerStatus(
                    response.data.data.server
                );

                setDatabaseStatus(
                    response.data.data.database
                );
            } catch (error) {
                console.error("Health check failed:", error.message);

                setServerStatus("offline");
                setDatabaseStatus("unknown");
            }
        };

        checkHealth();
    }, []);

    const stats = [
        {
            title: "Repositories",
            value: "0",
            icon: Github
        },
        {
            title: "Pull Requests",
            value: "0",
            icon: GitPullRequest
        },
        {
            title: "Reviews Completed",
            value: "0",
            icon: CheckCircle2
        },
        {
            title: "Issues Detected",
            value: "0",
            icon: CircleAlert
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            <nav className="h-16 border-b border-zinc-800 px-8 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ShieldCheck size={22} />
                    </div>

                    <h1 className="text-xl font-bold">
                        PR Sentinel
                    </h1>
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Activity size={16} />
                    AI Code Review Platform
                </div>

            </nav>

            <main className="max-w-7xl mx-auto px-8 py-10">

                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-2">
                        Developer Dashboard
                    </h2>

                    <p className="text-zinc-400">
                        Monitor your repositories and AI-powered
                        code reviews from one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.title}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <p className="text-zinc-400 text-sm">
                                        {stat.title}
                                    </p>

                                    <Icon className="text-indigo-400" size={20} />
                                </div>

                                <h3 className="text-3xl font-bold">
                                    {stat.value}
                                </h3>
                            </div>
                        );
                    })}

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                        <h3 className="text-lg font-semibold mb-2">
                            Welcome to PR Sentinel
                        </h3>

                        <p className="text-zinc-400 text-sm mb-6">
                            Your autonomous code review workspace
                            will appear here.
                        </p>

                        <button
                            disabled
                            className="flex items-center gap-2 bg-indigo-600
                            opacity-60 px-5 py-3 rounded-lg text-sm"
                        >
                            <Github size={18} />
                            GitHub integration coming soon
                        </button>

                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                        <h3 className="font-semibold mb-5">
                            System Status
                        </h3>

                        <div className="space-y-5">

                            <StatusItem
                                name="Express API"
                                status={serverStatus}
                            />

                            <StatusItem
                                name="MongoDB"
                                status={databaseStatus}
                            />

                            <StatusItem
                                name="AI Engine"
                                status="not configured"
                            />

                        </div>

                    </div>

                </div>

                <div className="mt-8 flex items-center gap-2 text-zinc-500 text-xs">
                    <Code2 size={14} />
                    PR Sentinel v1.0.0 | Development Environment
                </div>

            </main>
        </div>
    );
}

function StatusItem({ name, status }) {
    const healthy = status === "healthy" || status === "connected";

    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">
                {name}
            </span>

            <span className={`text-xs px-3 py-1 rounded-full ${
                healthy
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
            }`}>
                {status}
            </span>
        </div>
    );
}

export default App;
