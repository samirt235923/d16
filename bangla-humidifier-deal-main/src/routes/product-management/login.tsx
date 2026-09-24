import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export const Route = createFileRoute("/product-management/login")({
  head: () => ({ meta: [{ title: "Admin Login | GizmoZone BD" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) setError("Unable to sign in. Check your email and password.");
    else await navigate({ to: "/product-management" });
    setBusy(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-hero px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-card p-7 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">GizmoZone BD</p>
        <h1 className="mt-2 text-3xl font-extrabold">Admin login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with your admin account.</p>
        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        <label className="mt-6 block text-sm font-bold">
          Email
          <input
            className="mt-2 w-full rounded-xl border bg-background p-3 font-normal"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          Password
          <input
            className="mt-2 w-full rounded-xl border bg-background p-3 font-normal"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
