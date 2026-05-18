import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
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

const inputClass =
  "mt-2 h-[3.35rem] w-full rounded-[1.15rem] border border-black/10 bg-[#fffdf9] px-4 text-base text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10";

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
    <AuthShell
      backTo="/welcome"
      backLabel="Back to welcome"
      title="Create your DigiCloset"
      subtitle="Start saving complete looks and building a calm memory of your personal wardrobe."
      footer={
        <>
          Already have a closet?{" "}
          <Link
            to="/login"
            className="font-medium text-charcoal underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="min-h-[2.75rem]">
        {formError ? (
          <p className="rounded-[1.25rem] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {formError}
          </p>
        ) : null}
      </div>

      <form className="mt-1 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-[0.98rem] font-medium text-charcoal">
            Display name
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
            placeholder="How should DigiCloset address you?"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-[0.98rem] font-medium text-charcoal">Email</span>
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
          <span className="text-[0.98rem] font-medium text-charcoal">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Create your password"
            required
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[3.35rem] w-full items-center justify-center rounded-full bg-[#11110f] px-5 text-base font-medium text-ivory shadow-[0_18px_30px_rgba(17,17,15,0.22)] transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create My Closet"}
        </button>
      </form>
    </AuthShell>
  );
}
