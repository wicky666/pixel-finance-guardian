"use client";

import { FormEvent, useState } from "react";
import { loginWithPassword, type AuthUser } from "@/lib/auth/client";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onLoggedIn: (user: AuthUser) => void;
}

export function AuthDialog({ open, onClose, onLoggedIn }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage("登录后可保存你的记录，请先填写邮箱和密码。")
      return;
    }
    setSubmitting(true);
    setMessage("");
    const res = await loginWithPassword(email.trim(), password.trim());
    if (!res.ok) {
      setMessage(res.message);
      setSubmitting(false);
      return;
    }
    setMessage("欢迎回来，你的记录已经接上了。");
    onLoggedIn(res.user);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1520] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">登录后，帮你记住每一次决定</h2>
        <p className="mt-1 text-sm text-slate-300">把你的记录留下来</p>
        <p className="mt-2 text-xs text-slate-400">登录后可保存模拟、生成复盘、查看长期行为</p>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm"
          />
          {message && <p className="text-xs text-sky-200">{message}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-300">
              稍后再说
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white disabled:opacity-50">
              {submitting ? "登录中..." : "登录后保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
