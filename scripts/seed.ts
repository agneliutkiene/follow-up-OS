import { randomUUID } from "node:crypto";

import dotenv from "dotenv";
import { addDays, setHours, setMinutes, subDays } from "date-fns";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoUserEmail = process.env.DEMO_USER_EMAIL ?? "demo@followupos.local";
const demoUserPassword = process.env.DEMO_USER_PASSWORD ?? "DemoPass123";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function atHour(date: Date, hour: number, minute = 0) {
  return setMinutes(setHours(date, hour), minute).toISOString();
}

async function ensureDemoUser() {
  const { data: listed, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === demoUserEmail.toLowerCase(),
  );

  if (existing) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existing.id,
      {
        password: demoUserPassword,
        email_confirm: true,
      },
    );

    if (updateError) {
      throw updateError;
    }

    return existing.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: demoUserEmail,
    password: demoUserPassword,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw error ?? new Error("Unable to create demo user");
  }

  return data.user.id;
}

async function seed() {
  const userId = await ensureDemoUser();

  await supabaseAdmin.from("touches").delete().eq("user_id", userId);
  await supabaseAdmin.from("threads").delete().eq("user_id", userId);
  await supabaseAdmin.from("contacts").delete().eq("user_id", userId);

  const contacts = [
    {
      id: randomUUID(),
      user_id: userId,
      name: "Ari Carter",
      email: "ari@brightyard.co",
      x_handle: "@aricarter",
      notes: "Founder, prefers concise updates.",
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: "Mina Lopes",
      email: "mina@northloop.dev",
      x_handle: null,
      notes: "Asked for invoice reminder next week.",
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: "Drew Thompson",
      email: "drew@studiofield.io",
      x_handle: "@drewbuilds",
      notes: null,
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: "Priya Raman",
      email: "priya@craftsignal.com",
      x_handle: null,
      notes: "Warm lead from newsletter.",
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: "Noah Bennett",
      email: "noah@foundrylabs.xyz",
      x_handle: "@noahb",
      notes: "Quarterly strategy calls.",
    },
  ];

  const now = new Date();

  const threads = [
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[0].id,
      title: "Website redesign proposal",
      type: "lead",
      status: "open",
      next_followup_at: atHour(subDays(now, 3), 10),
      next_message_draft:
        "Quick check-in on the redesign proposal. Happy to answer any open questions.",
      last_touched_at: atHour(subDays(now, 4), 9),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[1].id,
      title: "Invoice INV-2045",
      type: "invoice",
      status: "open",
      next_followup_at: atHour(subDays(now, 1), 14),
      next_message_draft:
        "Friendly reminder about INV-2045. Let me know if anything is needed from my side.",
      last_touched_at: atHour(subDays(now, 2), 11),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[2].id,
      title: "Product demo follow-up",
      type: "meeting",
      status: "open",
      next_followup_at: atHour(now, 16),
      next_message_draft:
        "Great meeting today. Sending the recap and next steps as promised.",
      last_touched_at: atHour(subDays(now, 1), 16),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[3].id,
      title: "Partnership intro",
      type: "lead",
      status: "open",
      next_followup_at: atHour(now, 11),
      next_message_draft:
        "Wanted to continue our partnership conversation and share a concrete pilot idea.",
      last_touched_at: atHour(subDays(now, 1), 13),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[4].id,
      title: "Q2 planning check-in",
      type: "meeting",
      status: "open",
      next_followup_at: atHour(addDays(now, 2), 10),
      next_message_draft:
        "Checking in to lock our Q2 planning session.",
      last_touched_at: atHour(subDays(now, 1), 10),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[0].id,
      title: "Retainer renewal",
      type: "other",
      status: "open",
      next_followup_at: atHour(addDays(now, 5), 15),
      next_message_draft:
        "Sharing the renewal options before the current retainer ends.",
      last_touched_at: atHour(now, 9),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[1].id,
      title: "April invoice settled",
      type: "invoice",
      status: "closed",
      next_followup_at: null,
      next_message_draft: "Paid in full. Closed.",
      last_touched_at: atHour(subDays(now, 7), 17),
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[3].id,
      title: "Discovery call completed",
      type: "meeting",
      status: "closed",
      next_followup_at: null,
      next_message_draft: "Discovery complete and archived.",
      last_touched_at: atHour(subDays(now, 10), 12),
    },
  ];

  const touches = [
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[0].id,
      body: "Sent proposal PDF and timeline.",
      created_at: atHour(subDays(now, 5), 15),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[0].id,
      body: "Followed up after no response.",
      created_at: atHour(subDays(now, 4), 9),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[1].id,
      body: "Invoice sent with payment link.",
      created_at: atHour(subDays(now, 6), 10),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[2].id,
      body: "Ran 30-minute live demo.",
      created_at: atHour(subDays(now, 1), 16),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[2].id,
      body: "Shared demo recording link.",
      created_at: atHour(subDays(now, 1), 17),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[3].id,
      body: "Intro call done, requested one-pager.",
      created_at: atHour(subDays(now, 2), 12),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[4].id,
      body: "Suggested two planning slots.",
      created_at: atHour(subDays(now, 1), 10),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[5].id,
      body: "Renewal options drafted.",
      created_at: atHour(now, 9),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[6].id,
      body: "Payment confirmed and receipt sent.",
      created_at: atHour(subDays(now, 7), 17),
    },
    {
      id: randomUUID(),
      user_id: userId,
      thread_id: threads[7].id,
      body: "Discovery notes archived.",
      created_at: atHour(subDays(now, 10), 12),
    },
  ];

  const contactsResult = await supabaseAdmin.from("contacts").insert(contacts);
  if (contactsResult.error) {
    throw contactsResult.error;
  }

  const threadsResult = await supabaseAdmin.from("threads").insert(threads);
  if (threadsResult.error) {
    throw threadsResult.error;
  }

  const touchesResult = await supabaseAdmin.from("touches").insert(touches);
  if (touchesResult.error) {
    throw touchesResult.error;
  }

  console.log("Seed complete");
  console.log(`Demo email: ${demoUserEmail}`);
  console.log(`Demo password: ${demoUserPassword}`);
  console.log("Inserted 5 contacts, 8 threads, 10 touches.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
