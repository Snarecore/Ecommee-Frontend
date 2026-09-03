'use client';
import Image from "next/image";
import { LuMail, LuShieldCheck, LuArrowRight } from "react-icons/lu";
import companyLogo from "../../../assets/logo.svg";
import Link from "next/link";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { ChangeEvent, useMemo, useState } from "react";
import { forgetPasswordQueryKey } from "../../../config/query-key";

type FieldValues = { email: string };
const initialFieldValues: FieldValues = { email: "" };

const requiredFields: any = [
  { key: "email", value: "email", label: "text" },
];

const ForgotPassword = () => {
  const { postMutation, handleApiMutation } = useAPI();
  const apiUrl = apiConfig.auth.forgetPasswordUrl;
  const [fieldValues, setFieldValues] = useState<FieldValues>(initialFieldValues);
  const [isLoading, setIsLoading] = useState(false);

  const emailValid = useMemo(
    () => /^\S+@\S+\.\S+$/.test(fieldValues.email),
    [fieldValues.email]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const mutation = postMutation;
    const url = apiUrl;

    if (!emailValid) return;

    try {
      const result = await handleApiMutation({
        // @ts-ignore
        mutation,
        url,
        body: { email: fieldValues.email },
        invalidateQueryKey: [forgetPasswordQueryKey],
        showSuccessMessage: true,
        showErrorMessage: true,
        requiredFields
      });

      if (result?.success) {
        setFieldValues(initialFieldValues);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <div className="bg-white dark:bg-slate-800/95 border border-gray-200/80 dark:border-slate-700/80 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 sm:p-9 transition-all">
        <div className="text-center mb-6">
          <Link href={`/`} className="inline-block transition-transform hover:scale-105 duration-200">
            <Image
              src={companyLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
              alt="Fashion Time"
              width={190}
              height={45}
              priority
              className="h-9 sm:h-11 w-auto mx-auto mb-4 object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Forgot Password?</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Enter your email to receive password reset instructions.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmitForm} noValidate>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
                <LuMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={fieldValues.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-all duration-200 ${
                  !emailValid && fieldValues.email.length > 0
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
                    : "border-gray-300 dark:border-slate-600 focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10"
                }`}
                required
              />
            </div>
            {!emailValid && fieldValues.email.length > 0 && (
              <p className="text-xs text-red-500 mt-1 font-medium">Please enter a valid email address.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!emailValid || isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-[var(--color-green-primary)] hover:bg-[var(--color-green-secondary)] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <LuArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2">
            Remembered your password?{" "}
            <Link
              href={"/login"}
              className="font-bold text-[var(--color-green-primary)] dark:text-emerald-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
