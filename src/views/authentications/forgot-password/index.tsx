'use client';
import Image from "next/image";
import { LuMail } from "react-icons/lu";
import companyLogo from "../../../assets/BazaarBound Logo.svg";
import Link from "next/link";;
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json"
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
      setIsLoading(false)
    }
  };
  return (
    <div className="lg:p-12 flex h-screen w-screen items-center justify-center">
      <div className="w-full lg:w-1/2 px-4 flex items-center">
        <div className="w-2xl mx-auto">
          <div>
            <Link href={`/`}>
              <Image src={companyLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt="company logo" className="mx-auto mb-8" />
            </Link>
            <p className="text-xl md:text-3xl font-bold text-[var(--color-black-primary)] mb-2">Forgot Password?</p>
            <p className="text-sm md:text-[15px] text-[var(--color-black-primary)]">
              If you forgot your password, well, then we’ll email you instructions to reset your password.
            </p>
          </div>

          <form className="space-y-5 mt-4" onSubmit={handleSubmitForm}>
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5">
                  <span className="text-[14px] font-medium text-[var(--color-black-primary)]">
                    Email Address
                  </span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={fieldValues.email}
                    onChange={handleChange}
                    className="w-full bg-white px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-green-primary)] transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none  transition-colors duration-200">
                    <LuMail className="h-5 w-5" />
                  </div>
                  {!emailValid && fieldValues.email.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">Enter a valid email.</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!emailValid || isLoading}
              className="w-full bg-[var(--color-green-primary)]  text-white py-2 rounded-lg font-bold transform transition-all duration-200 cursor-pointer"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-[15px] text-[var(--color-black-primary)]">
              Return to {" "}
              <Link href={"/login"}
                className="font-semibold hover:text-[var(--color-green-primary)] hover:border-b-2 border-[var(--color-green-primary)] transition-colors duration-200"
              >
                login
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
