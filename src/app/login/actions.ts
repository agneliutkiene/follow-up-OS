"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function loginRedirectWithError(message: string) {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signInAction(formData: FormData) {
  const email = toText(formData.get("email"));
  const password = toText(formData.get("password"));

  if (!email || !password) {
    loginRedirectWithError("Email and password are required.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginRedirectWithError(error.message);
  }

  redirect("/inbox");
}

export async function signUpAction(formData: FormData) {
  const email = toText(formData.get("email"));
  const password = toText(formData.get("password"));

  if (!email || !password) {
    loginRedirectWithError("Email and password are required.");
  }

  if (password.length < 6) {
    loginRedirectWithError("Password should be at least 6 characters.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    loginRedirectWithError(error.message);
  }

  if (data.session) {
    redirect("/inbox");
  }

  redirect(
    "/login?message=Account created. Confirm your email if your project requires confirmation, then sign in.",
  );
}
