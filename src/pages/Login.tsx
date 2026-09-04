import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setInfoMsg('Check your inbox to confirm your email before signing in.');
        } else {
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-[#111216] border border-white/[0.08] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-lg mx-auto shadow-md">
            W
          </div>
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
            Weave365 <span className="text-amber-400 font-normal">Reseller Portal</span>
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUp ? 'Create your boutique reseller account' : 'Sign in to manage your boutique storefronts'}
          </p>
          <div className="inline-block px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-500 font-mono">
            reseller.weave365.com
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Work Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="boutique@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#090a0c] border border-white/[0.08] rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#090a0c] border border-white/[0.08] rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs tracking-wide rounded-xl transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Reseller Account' : 'Sign in to Portal'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-4 border-t border-white/[0.06] text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Register as Reseller"}
          </button>
        </div>
      </div>
    </div>
  );
}
