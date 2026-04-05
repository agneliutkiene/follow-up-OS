import type { ThreadType } from "@/lib/types";

export function buildDraftTemplate(
  type: ThreadType,
  threadTitle: string,
  contactName: string,
) {
  switch (type) {
    case "lead":
      return `Hi ${contactName},\n\nQuick follow-up on ${threadTitle}. Are you still interested in moving this forward this week?\n\nBest,\n[Your name]`;
    case "invoice":
      return `Hi ${contactName},\n\nFriendly reminder about ${threadTitle}. Please let me know if you need anything from me to finalize payment.\n\nThanks,\n[Your name]`;
    case "meeting":
      return `Hi ${contactName},\n\nFollowing up on ${threadTitle}. Would one of these times work for you this week?\n- [Option 1]\n- [Option 2]\n\nBest,\n[Your name]`;
    default:
      return `Hi ${contactName},\n\nFollowing up on ${threadTitle}. Let me know the best next step from your side.\n\nThanks,\n[Your name]`;
  }
}
