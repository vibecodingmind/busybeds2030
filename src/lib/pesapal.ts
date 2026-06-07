/**
 * PesaPal v3 API Client
 * 
 * Supports both sandbox and live environments.
 * Set PESAPAL_BASE_URL env var to switch between:
 * - Sandbox: https://cybqa.pesapal.com/pesapalv3/api/Transactions
 * - Live: https://pay.pesapal.com/v3/api/Transactions
 * 
 * Required env vars:
 * - PESAPAL_CONSUMER_KEY
 * - PESAPAL_CONSUMER_SECRET
 * - PESAPAL_BASE_URL (optional, defaults to sandbox)
 * - NEXTAUTH_URL (for generating callback URLs)
 */

interface PesaPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
}

interface PesaPalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: string;
  status?: string;
}

interface PesaPalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status: string;
  description: string;
  merchant_reference: string;
  order_tracking_id: string;
  payment_account?: string;
  reference_code?: string;
  error?: string;
}

interface PesaPalIPNRegistration {
  ipn_id: string;
  url: string;
  created_date: string;
  error?: string;
}

// Cache the OAuth token
let cachedToken: { token: string; expiresAt: number } | null = null;

function getBaseUrl(): string {
  return (
    process.env.PESAPAL_BASE_URL ||
    "https://cybqa.pesapal.com/pesapalv3/api/Transactions"
  );
}

function getApiBaseUrl(): string {
  const baseUrl = getBaseUrl();
  // Extract the base up to /api or the domain
  const apiIndex = baseUrl.indexOf("/api");
  if (apiIndex > -1) {
    return baseUrl.substring(0, apiIndex + 4); // include /api
  }
  return baseUrl;
}

/**
 * Get OAuth2 Bearer token from PesaPal
 */
export async function getPesaPalToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("PesaPal credentials not configured");
  }

  const apiBase = getApiBaseUrl();
  const tokenUrl = `${apiBase}/Auth/RequestToken`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const data: PesaPalTokenResponse = await response.json();

  if (!response.ok || data.error) {
    console.error("PesaPal token error:", data);
    throw new Error(`Failed to get PesaPal token: ${data.error || response.statusText}`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Submit an order to PesaPal for payment
 */
export async function submitOrder(params: {
  amount: number;
  currency: string;
  description: string;
  merchantReference: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  callbackUrl: string;
  ipnId?: string;
}): Promise<PesaPalOrderResponse> {
  const token = await getPesaPalToken();
  const apiBase = getApiBaseUrl();
  const submitUrl = `${apiBase}/SubmitOrderRequest`;

  const [firstName, ...lastNameParts] = params.firstName.split(" ");
  const lastName = lastNameParts.join(" ") || firstName;

  const payload = {
    id: params.merchantReference,
    currency: params.currency,
    amount: params.amount,
    description: params.description,
    callback_url: params.callbackUrl,
    notification_id: params.ipnId || "",
    billing_address: {
      email_address: params.email,
      phone_number: params.phoneNumber,
      country_code: "TZ",
      first_name: firstName,
      last_name: lastName,
    },
  };

  const response = await fetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data: PesaPalOrderResponse = await response.json();

  if (!response.ok || data.error) {
    console.error("PesaPal submit order error:", data);
    throw new Error(`Failed to submit PesaPal order: ${data.error || response.statusText}`);
  }

  return data;
}

/**
 * Get transaction status from PesaPal
 */
export async function getTransactionStatus(
  orderTrackingId: string
): Promise<PesaPalTransactionStatus> {
  const token = await getPesaPalToken();
  const apiBase = getApiBaseUrl();
  const statusUrl = `${apiBase}/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;

  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data: PesaPalTransactionStatus = await response.json();

  if (!response.ok || data.error) {
    console.error("PesaPal get transaction status error:", data);
    throw new Error(
      `Failed to get PesaPal transaction status: ${data.error || response.statusText}`
    );
  }

  return data;
}

/**
 * Register IPN URL with PesaPal
 */
export async function registerIPN(
  ipnUrl: string
): Promise<PesaPalIPNRegistration> {
  const token = await getPesaPalToken();
  const apiBase = getApiBaseUrl();
  const registerUrl = `${apiBase}/URLSetup/RegisterIPN`;

  const response = await fetch(registerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET", // PesaPal sends both GET and POST
    }),
  });

  const data: PesaPalIPNRegistration = await response.json();

  if (!response.ok || data.error) {
    console.error("PesaPal register IPN error:", data);
    throw new Error(
      `Failed to register PesaPal IPN: ${data.error || response.statusText}`
    );
  }

  return data;
}

/**
 * Package pricing in TZS
 */
export const PACKAGE_PRICES: Record<string, number> = {
  STARTER: 20000,
  STANDARD: 50000,
  PREMIUM: 120000,
};

export const PACKAGE_CREDITS: Record<string, number> = {
  STARTER: 5,
  STANDARD: 15,
  PREMIUM: 999,
};
