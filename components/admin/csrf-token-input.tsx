import { getServerCsrfToken } from "@/lib/security/csrf";

export async function CsrfTokenInput() {
  const csrfToken = await getServerCsrfToken();

  return <input type="hidden" name="_csrf" value={csrfToken} />;
}
