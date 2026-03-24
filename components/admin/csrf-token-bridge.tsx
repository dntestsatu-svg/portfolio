import { getServerCsrfToken } from "@/lib/security/csrf";

export async function CsrfTokenBridge() {
  const csrfToken = await getServerCsrfToken();

  return <div id="admin-csrf-token" data-csrf-token={csrfToken} hidden />;
}
