// Stub: WhatsApp / notification sending is a later sprint (S4.8). Only logs for now.
export type Notification = {
  to: string;
  template: string;
  data?: Record<string, unknown>;
};

export async function notify(n: Notification): Promise<void> {
  console.log("[notify stub]", n.template, "->", n.to, n.data ?? {});
}
