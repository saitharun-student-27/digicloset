import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function getFriendlyAuthError(error) {
  const detail = error?.response?.data?.detail;

  if (detail === "Invalid email or password.") {
    return detail;
  }

  return "Invalid email or password.";
}

const inputClass =
  "mt-2 h-[3.2rem] w-full rounded-[1.1rem] border border-black/10 bg-[#fffdf9] px-4 text-base text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showDevFill, setShowDevFill] = useState(false);

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

  function fillDevLogin() {
    setEmail("dev@digicloset.local");
    setPassword("devpassword123");
  }

  return (
    <AuthShell
      backTo="/welcome"
      backLabel="Back to welcome"
      title={
        <>
          Welcome back
          <br />
          to your wardrobe.
        </>
      }
      subtitle="Open your private wardrobe memory and come back to the looks that worked."
      footer={
        <>
          Don&apos;t have a closet yet?{" "}
          <Link
            to="/signup"
            className="font-medium text-charcoal underline-offset-4 hover:underline"
          >
            Create your DigiCloset
          </Link>
        </>
      }
    >
      {helperMessage ? (
        <p className="rounded-[1.15rem] border border-brass/15 bg-[#f6f0e7] px-4 py-3 text-sm leading-6 text-stone">
          {helperMessage}
        </p>
      ) : null}

      {authError ? (
        <p className="mt-3 rounded-[1.15rem] border border-brass/15 bg-[#f6f0e7] px-4 py-3 text-sm leading-6 text-stone">
          {authError}
        </p>
      ) : null}

      <div className="min-h-[2.5rem]">
        {formError ? (
          <p className="mt-2 rounded-[1.15rem] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {formError}
          </p>
        ) : null}
      </div>

      <form className="mt-1 space-y-3.5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-[0.93rem] font-medium text-charcoal">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="Enter your email"
            required
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-[0.93rem] font-medium text-charcoal">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[3.2rem] w-full items-center justify-center rounded-full bg-[#11110f] px-5 text-base font-medium text-ivory shadow-[0_18px_30px_rgba(17,17,15,0.2)] transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Opening..." : "Open My Closet"}
        </button>
      </form>

      {import.meta.env.DEV ? (
        <div className="mt-4 text-center text-xs leading-5 text-stone/75">
          <p>Local dev account available.</p>
          <button
            type="button"
            onClick={() => {
              setShowDevFill((current) => !current);
              if (!showDevFill) {
                fillDevLogin();
              }
            }}
            className="mt-1 text-[0.76rem] font-medium text-stone underline-offset-4 hover:text-charcoal hover:underline"
          >
            {showDevFill ? "Hide dev helper" : "Fill dev login"}
          </button>
        </div>
      ) : null}
    </AuthShell>
  );
}
