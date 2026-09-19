import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabase";
import { Plus } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans items-center">
      <div className="w-full sm:max-w-[420px] px-4 sm:px-0">
        <div className="bg-[#0f0f13] sm:rounded-2xl border border-white/[0.08] p-10 shadow-2xl">
          
          <div className="flex items-center gap-3 mb-10">
            <Logo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="text-white font-bold text-[18px] tracking-tight">ContextIQ </span>
          </div>

          <h2 className="text-[26px] font-bold text-white mb-2 tracking-tight">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Sign in to access your knowledge base.</p>

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-2">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white rounded-[8px] focus-visible:ring-1 focus-visible:ring-white/20 h-11 shadow-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-2">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white rounded-[8px] focus-visible:ring-1 focus-visible:ring-white/20 h-11 shadow-none tracking-widest placeholder:tracking-normal"
                placeholder="��������"
              />
              <div className="mt-3 flex justify-end">
                <a href="#" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors font-medium">Forgot password?</a>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full bg-transparent hover:bg-white/[0.04] border border-white/[0.12] text-white rounded-[8px] h-11 font-medium transition-all shadow-none">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-[13px] text-slate-500 flex justify-center items-center gap-1.5 font-medium">
            <span>No account?</span>
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
