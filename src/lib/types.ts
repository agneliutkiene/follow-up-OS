export type ThreadType = "lead" | "invoice" | "meeting" | "other";
export type ThreadStatus = "open" | "closed";

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  x_handle: string | null;
  notes: string | null;
  created_at: string;
};

export type Thread = {
  id: string;
  user_id: string;
  contact_id: string;
  title: string;
  type: ThreadType;
  status: ThreadStatus;
  next_followup_at: string | null;
  next_message_draft: string | null;
  last_touched_at: string;
  created_at: string;
};

export type Touch = {
  id: string;
  user_id: string;
  thread_id: string;
  body: string;
  created_at: string;
};
