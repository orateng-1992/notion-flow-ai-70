export type ToolId = "email" | "meeting" | "tasks" | "convert";

export const TOOLS: Record<
  ToolId,
  { label: string; kicker: string; placeholder: string; prompt: string; sample: string }
> = {
  email: {
    label: "Email drafting",
    kicker: "01",
    placeholder: "Paste rough notes, e.g. customer asked about bulk pricing, reply by Friday…",
    prompt:
      "Act as a professional workplace communication assistant. Convert my notes into a clear, professional and concise email. Use a friendly but professional tone and include a suitable subject line and clear call to action.",
    sample:
      "Customer Thandi from Bloom Café asked if we can supply 200 branded mugs by 30 Oct. We can do it, R45 each, need 50% deposit. Ask her to confirm logo file.",
  },
  meeting: {
    label: "Meeting summary",
    kicker: "02",
    placeholder: "Paste meeting notes or a transcript…",
    prompt:
      "Summarise the following meeting notes. Identify the key discussion points, decisions made, action items, responsible persons and deadlines. Present the information in a clear and easy-to-read format. Use these markdown headings: Meeting overview, Key discussion points, Decisions made, Action items (as a table with columns Action, Responsible person, Deadline).",
    sample:
      "Weekly team sync. Sipho said website launch slipping, needs copy from Lerato by Tuesday. Agreed to move launch to 15 Nov. Naledi will call the printer about flyers this week. Budget for ads approved at R5000. Lerato to draft social posts by Friday.",
  },
  tasks: {
    label: "Daily plan",
    kicker: "03",
    placeholder: "List today's tasks, one per line…",
    prompt:
      "Create a daily task plan from the following list of tasks. Prioritise the tasks according to urgency and importance. Include suggested time slots and identify tasks that can be delegated or scheduled for later. Present the plan as a markdown table with columns Priority (High/Medium/Low), Task, Suggested Time, then a short section listing tasks to delegate or schedule later.",
    sample:
      "Reply to urgent customer emails\nPrepare quotation for Mokoena Builders\nUpdate business records\nOrganise digital files\nCall supplier about late stock\nPost on Instagram",
  },
  convert: {
    label: "Meeting → tasks",
    kicker: "04",
    placeholder: "Paste meeting notes to extract tasks…",
    prompt:
      "Review these meeting notes and identify all tasks that need to be completed. For each task, provide the task description, responsible person, priority and deadline. Present them as a markdown table with columns Task, Responsible person, Priority, Deadline, ready to copy into Notion. Use 'Unassigned' or 'Not set' when information is missing.",
    sample:
      "Ops meeting: Zanele will reconcile September invoices by the 12th. Someone needs to renew the domain before end of month — urgent. Kabelo to interview two delivery drivers next week. Discussed new loyalty card idea, Amahle to research costs.",
  },
};

export function isToolId(v: unknown): v is ToolId {
  return typeof v === "string" && v in TOOLS;
}
