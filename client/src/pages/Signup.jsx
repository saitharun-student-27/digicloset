import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function getFriendlySignupError(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.includes("already exists")) {
    return "An account with this email already exists.";
  }

  if (Array.isArray(detail)) {
    const passwordError = detail.find((item) => item.loc?.includes("password"));
    if (passwordError) {
      return "Password must be at least 8 characters.";
    }
  }

  return "Could not create your account right now.";
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, clearAuthError } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await signup({
        email,
        password,
        display_name: displayName || null,
      });
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(getFriendlySignupError(error));
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
        <h1 className="mt-3 text-3xl font-semibold text-charcoal">Create your wardrobe</h1>
        <p className="mt-3 text-sm leading-6 text-stone">
          Start a private closet built around complete looks, not scattered inventory rows.
        </p>

        {formError ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-charcoal">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/15"
            />
          </label>

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
              autoComplete="new-password"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/15"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-stone">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-charcoal underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
