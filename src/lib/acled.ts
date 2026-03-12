let tokenCache: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null = null;

async function authenticate(): Promise<string | null> {
  const email = process.env.ACLED_EMAIL;
  const password = process.env.ACLED_PASSWORD;
  if (!email || !password) return null;

  const res = await fetch("https://acleddata.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: email,
      password,
      grant_type: "password",
      client_id: "acled",
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();

  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000, // 1 min buffer
  };

  return tokenCache.accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!tokenCache?.refreshToken) return null;

  const res = await fetch("https://acleddata.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: tokenCache.refreshToken,
      grant_type: "refresh_token",
      client_id: "acled",
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();

  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };

  return tokenCache.accessToken;
}

export async function getACLEDToken(): Promise<string | null> {
  // Reuse cached token if still valid
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  // Try refresh first if we have a refresh token
  if (tokenCache?.refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return refreshed;
  }

  // Fall back to full authentication
  return authenticate();
}
