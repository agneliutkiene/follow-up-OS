"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalText(value: FormDataEntryValue | null) {
  const text = toText(value);
  return text.length > 0 ? text : null;
}

function contactsRedirectWithError(message: string) {
  redirect(`/contacts?error=${encodeURIComponent(message)}`);
}

export async function createContactAction(formData: FormData) {
  const name = toText(formData.get("name"));
  const email = toOptionalText(formData.get("email"));
  const xHandle = toOptionalText(formData.get("x_handle"));
  const notes = toOptionalText(formData.get("notes"));

  if (!name) {
    contactsRedirectWithError("Name is required.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contacts").insert({
    name,
    email,
    x_handle: xHandle,
    notes,
  });

  if (error) {
    contactsRedirectWithError(error.message);
  }

  revalidatePath("/contacts");
  redirect("/contacts?message=Contact%20created.");
}

export async function updateContactAction(formData: FormData) {
  const id = toText(formData.get("id"));
  const name = toText(formData.get("name"));
  const email = toOptionalText(formData.get("email"));
  const xHandle = toOptionalText(formData.get("x_handle"));
  const notes = toOptionalText(formData.get("notes"));

  if (!id) {
    contactsRedirectWithError("Contact ID is missing.");
  }

  if (!name) {
    contactsRedirectWithError("Name is required.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      name,
      email,
      x_handle: xHandle,
      notes,
    })
    .eq("id", id);

  if (error) {
    contactsRedirectWithError(error.message);
  }

  revalidatePath("/contacts");
  revalidatePath("/inbox");
  redirect("/contacts?message=Contact%20updated.");
}
