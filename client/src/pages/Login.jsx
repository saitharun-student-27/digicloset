import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function getFriendlyAuthError(error) {
  const detail = error?.response?.data?.detail;

  if (detail === "Invalid email or password.") {
    return detail;
  }

  return "Invalid email or password.";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const redirectTarget = location.state?.from || "/";
  const helperMessage = location.state?.message || "";

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      await login({ email, password });
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setFormError(getFriendlyAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[100vh] min-h-[100dvh] items-center justify-center bg-[linear-gradient(180deg,#f8f5ee_0%,#eee6d9_100%)] px-4 py-8">
      <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white/88 p-5 shadow-soft backdrop-blur sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
          DigiCloset
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-charcoal">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-stone">
          Sign in to open your private wardrobe and continue from your saved outfit memories.
        </p>

        {helperMessage ? (
          <p className="mt-4 rounded-2xl bg-ivory px-4 py-3 text-sm text-stone">
            {helperMessage}
          </p>
        ) : null}

        {authError ? (
          <p className="mt-4 rounded-2xl bg-ivory px-4 py-3 text-sm text-stone">
            {authError}
          </p>
        ) : null}

        {formError ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-charcoal">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/15"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-charcoal">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/15"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {import.meta.env.DEV ? (
          <div className="mt-5 rounded-2xl bg-ivory px-4 py-3 text-sm text-stone">
            <p className="font-medium text-charcoal">Local dev account</p>
            <p className="mt-1">dev@digicloset.local</p>
            <p>devpassword123</p>
          </div>
        ) : null}

        <p className="mt-5 text-sm text-stone">
          New here?{" "}
          <Link to="/signup" className="font-medium text-charcoal underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
