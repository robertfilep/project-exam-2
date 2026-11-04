import { getApiKeyOptions } from "./apiConfig";

export const API_BASE = "https://v2.api.noroff.dev";

export async function request(path, { token, headers, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getApiKeyOptions(token).headers, ...headers },
  });
  if (
    response.status === 204 ||
    (response.ok && typeof response.json !== "function")
  )
    return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.errors?.[0]?.message ||
        `Request failed (${response.status}). Please try again.`,
    );
  }
  return body;
}

export async function fetchAllPages(path, options = {}) {
  const items = [];
  let page = 1;
  while (page) {
    const separator = path.includes("?") ? "&" : "?";
    const body = await request(
      `${path}${separator}limit=100&page=${page}`,
      options,
    );
    items.push(...(body?.data || []));
    page = body?.meta?.nextPage || null;
  }
  return items;
}
