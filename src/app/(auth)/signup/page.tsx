import type { Metadata } from "next";
import UserRegistration from "@/views/authentications/user/registration";

export const metadata: Metadata = {
  title: "Sign Up | Fashion Time",
  description: "Create a new account on Fashion Time to explore exclusive clothing and fashion items.",
};

export default function SignupPage() {
  return <UserRegistration />;
}
