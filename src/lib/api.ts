import { supabase } from './supabase';

// ── helpers ──────────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    await supabase.auth.signOut();
    window.location.href = '/login';
    // The redirect above will navigate away; throw so callers don't continue.
    throw new Error('Session expired — redirecting to login.');
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ── typed API functions ──────────────────────────────────────────────────────

/** Upload a PDF file to the backend for indexing. */
export async function uploadPdf(
  file: File,
): Promise<{ status: string; filename: string }> {
  const headers = await getAuthHeaders();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers,          // Content-Type is set automatically by the browser for FormData
    body: form,
  });
  return handleResponse(res);
}

/** Ask a question against the indexed knowledge base. */
export async function askQuery(
  query: string,
): Promise<{ answer: string; sources: string[]; latency: number }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ask?q=${encodeURIComponent(query)}`, {
    headers,
  });
  return handleResponse(res);
}

/** Retrieve the list of indexed documents. */
export async function getDocuments(): Promise<{ documents: any[] }> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/documents', { headers });
  return handleResponse(res);
}

/** Check whether any documents have been indexed. */
export async function getStatus(): Promise<{ documents_indexed: boolean }> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/status', { headers });
  return handleResponse(res);
}
