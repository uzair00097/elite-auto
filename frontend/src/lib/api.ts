const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Vehicle = {
  id: number;
  seller_id: number;
  category: "car" | "motorcycle";
  title: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: "automatic" | "manual";
  fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "cng";
  city: string;
  condition: "excellent" | "good" | "fair";
  description: string;
  status: "active" | "sold";
  boosted: boolean;
  created_at: string;
  images: { id: number; image_url: string; is_primary: boolean; sort_order: number }[];
  seller_name: string;
  seller_phone: string | null;
  seller_verified: boolean;
};

export type VehicleListResponse = { total: number; items: Vehicle[] };

export type User = {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  phone_verified: boolean;
  is_seller: boolean;
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // ignore non-JSON error bodies
    }

    // Only an authenticated request (one that carried a token) failing with 401 means the
    // session itself is invalid/expired — a bare login attempt with wrong credentials also
    // returns 401 but never carries a token, so it's excluded here.
    if (res.status === 401 && token && typeof window !== "undefined") {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        // This is a plain utility module outside React's tree — no useRouter() available here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login?expired=1";
      }
    }

    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  register: (payload: { name: string; email: string; password: string; city?: string; phone: string }) =>
    request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request<User>("/auth/me"),

  sendPhoneOtp: () =>
    request<{ demo_mode: boolean; code: string; expires_in_seconds: number; note: string }>(
      "/auth/phone/send-otp",
      { method: "POST" }
    ),

  verifyPhoneOtp: (code: string) =>
    request<User>("/auth/phone/verify-otp", { method: "POST", body: JSON.stringify({ code }) }),

  listVehicles: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    const qs = query.toString();
    return request<VehicleListResponse>(`/vehicles${qs ? `?${qs}` : ""}`);
  },

  semanticSearch: (q: string, params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams({ q });
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    return request<VehicleListResponse>(`/search/semantic?${query.toString()}`);
  },

  listMakes: (category: "car" | "motorcycle") =>
    request<{ make: string; count: number }[]>(`/vehicles/makes?category=${category}`),

  getVehicle: (id: number) => request<Vehicle>(`/vehicles/${id}`),

  similarVehicles: (id: number) => request<VehicleListResponse>(`/vehicles/${id}/similar`),

  myVehicles: () => request<VehicleListResponse>("/vehicles/mine"),

  createVehicle: (payload: Record<string, unknown>) =>
    request<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(payload) }),

  updateVehicle: (id: number, payload: Record<string, unknown>) =>
    request<Vehicle>(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteVehicle: (id: number) => request<void>(`/vehicles/${id}`, { method: "DELETE" }),

  uploadSignature: () =>
    request<{ timestamp: number; signature: string; api_key: string; cloud_name: string; folder: string }>(
      "/uploads/signature",
      { method: "POST" }
    ),

  addVehicleImage: (id: number, imageUrl: string, isPrimary: boolean) =>
    request<Vehicle>(`/vehicles/${id}/images?image_url=${encodeURIComponent(imageUrl)}&is_primary=${isPrimary}`, {
      method: "POST",
    }),

  sendFeedback: (payload: { message: string; email?: string }) =>
    request<{ id: number }>("/feedback", { method: "POST", body: JSON.stringify(payload) }),
};

export { ApiError };
