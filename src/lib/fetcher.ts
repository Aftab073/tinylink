export interface LinkData {
  code: string;
  target: string;
  clicks: number;
  createdAt: string;
  lastClicked: string | null;
}

// Generic fetch wrapper handling JSON parsing and error throwing
export const fetcher = async <T = any>(url: string, options?: RequestInit): Promise<T | null> => {
  const res = await fetch(url, options);

  if (!res.ok) {
    // Try to parse JSON error, otherwise throw generic message
    const data = await res.json().catch(() => null);
    const msg = data && (data as any).error ? (data as any).error : `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  // No content (204)
  if (res.status === 204) return null;

  // Try to parse JSON body; if none, return null
  return res.json().catch(() => null);
};
