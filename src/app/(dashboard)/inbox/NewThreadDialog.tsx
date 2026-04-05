"use client";

import { useEffect, useState } from "react";

type ContactOption = {
  id: string;
  name: string;
};

type NewThreadDialogProps = {
  contacts: ContactOption[];
  preselectedContactId?: string;
  createThreadAction: (formData: FormData) => void | Promise<void>;
};

function localDateInputValue(date: Date) {
  const padded = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = padded(date.getMonth() + 1);
  const day = padded(date.getDate());
  const hours = padded(date.getHours());
  const minutes = padded(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function NewThreadDialog({
  contacts,
  preselectedContactId,
  createThreadAction,
}: NewThreadDialogProps) {
  const [open, setOpen] = useState(false);
  const [defaultNextFollowup] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localDateInputValue(tomorrow);
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
      >
        New thread
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-thread-title"
            className="relative z-10 w-full max-w-2xl rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div>
                <h2 id="new-thread-title" className="text-base font-semibold text-[var(--ink)]">
                  Create thread
                </h2>
                <p className="text-sm text-[var(--ink-muted)]">
                  Every open thread needs a next follow-up date.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--line)] px-2.5 py-1 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
              >
                Close
              </button>
            </div>

            <form
              action={createThreadAction}
              className="grid gap-3 p-4 md:grid-cols-2"
              onSubmit={() => setOpen(false)}
            >
              <input type="hidden" name="status" value="open" />

              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Contact</span>
                <select
                  name="contact_id"
                  required
                  defaultValue={preselectedContactId ?? ""}
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                >
                  <option value="" disabled>
                    Select a contact
                  </option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Thread title</span>
                <input
                  required
                  name="title"
                  placeholder="Invoice #2045"
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Type</span>
                <select
                  name="type"
                  defaultValue="lead"
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                >
                  <option value="lead">Lead</option>
                  <option value="invoice">Invoice</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Next follow-up</span>
                <input
                  required
                  type="datetime-local"
                  name="next_followup_at"
                  defaultValue={defaultNextFollowup}
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-[var(--ink-muted)]">Next message draft</span>
                <textarea
                  name="next_message_draft"
                  rows={3}
                  placeholder="Optional draft for your next follow-up"
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>

              <div className="flex items-center gap-2 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  Create thread
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
