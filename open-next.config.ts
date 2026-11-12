import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults only: no R2 / KV cache (the app is mostly dynamic).
export default defineCloudflareConfig();
