"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

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

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        New thread
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New thread"
        description="Every open thread needs a next follow-up date."
      >
        <form
          action={createThreadAction}
          className="grid gap-3 md:grid-cols-2"
          onSubmit={() => setOpen(false)}
        >
          <input type="hidden" name="status" value="open" />

          <label className="space-y-1 text-sm">
            <span className="text-[var(--muted)]">Contact</span>
            <Select name="contact_id" required defaultValue={preselectedContactId ?? ""}>
              <option value="" disabled>
                Select a contact
              </option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--muted)]">Thread title</span>
            <Input required name="title" placeholder="Invoice #2045" />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--muted)]">Type</span>
            <Select name="type" defaultValue="lead">
              <option value="lead">Lead</option>
              <option value="invoice">Invoice</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </Select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--muted)]">Next follow-up</span>
            <Input
              required
              type="datetime-local"
              name="next_followup_at"
              defaultValue={defaultNextFollowup}
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-[var(--muted)]">Next message draft</span>
            <Textarea
              name="next_message_draft"
              rows={3}
              placeholder="Optional draft for your next follow-up"
            />
          </label>

          <div className="flex items-center gap-2 md:col-span-2">
            <Button type="submit" variant="primary">
              Create thread
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
