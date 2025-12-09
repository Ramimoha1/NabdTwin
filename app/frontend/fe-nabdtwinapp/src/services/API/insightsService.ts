const parseJsonSafe = (raw: string | null) => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
};

const stripQuotes = (val: unknown) =>
    typeof val === "string" ? val.replace(/^"+|"+$/g, "") : "";

const resolveToken = () => {
    const direct =
        localStorage.getItem("jwt") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("jwt") ||
        sessionStorage.getItem("token");
    if (direct) return stripQuotes(direct);

    const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userParsed = parseJsonSafe(userRaw);
    if (userParsed?.jwt || userParsed?.token) return stripQuotes(userParsed.jwt || userParsed.token);

    const persistedRoot = parseJsonSafe(localStorage.getItem("persist:root"));
    if (persistedRoot) {
        const fromRoot = stripQuotes(persistedRoot.token || persistedRoot.jwt || persistedRoot.accessToken);
        if (fromRoot) return fromRoot;

        const authSliceRaw = persistedRoot?.auth;
        const authSlice = typeof authSliceRaw === "string" ? parseJsonSafe(authSliceRaw) : authSliceRaw;
        const fromPersist =
            authSlice?.jwt ||
            authSlice?.token ||
            authSlice?.accessToken ||
            authSlice?.user?.jwt ||
            authSlice?.user?.token;
        if (fromPersist) return stripQuotes(fromPersist);
    }
    return "";
};

const MOCK_KPIS = [
    { code: "KPI001", label: "Total Revenue", name: "Revenue", value: 1250000, target: 1500000, unit: "$" },
    { code: "KPI002", label: "Active Users", name: "Users", value: 8750, target: 10000, unit: "" },
    { code: "KPI003", label: "Conversion Rate", name: "Conversion", value: 3.45, target: 4.5, unit: "%" },
    { code: "KPI004", label: "Customer Satisfaction", name: "CSAT", value: 4.8, target: 4.9, unit: "/5" },
];

export async function fetchInsightsKpis() {
    const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";
    const token = resolveToken();
    console.log("Auth token detected:", token ? `${token.slice(0, 8)}...` : "none");

    try {
        console.log("Fetching insights from:", `${API}/api/insights`);

        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const requestInit: RequestInit = { headers, credentials: "include" };

        const response = await fetch(`${API}/api/insights`, requestInit);
        if (response.ok) {
            const data = await response.json();
            console.log("Full insights response:", data);

            // Extract KPIs from nested structure
            const kpis = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.kpis)
                        ? data.kpis
                        : Array.isArray(data?.attributes?.kpis)
                            ? data.attributes.kpis
                            : [];

            console.log("Extracted KPIs:", kpis);

            // Use mock data if empty
            if (kpis.length === 0) {
                console.log("No KPIs from API, using mock data");
                return MOCK_KPIS;
            }
            return kpis;
        }

        if (response.status === 401 || response.status === 403) {
            throw new Error("Access is forbidden. Please ensure your Strapi role has permission to access insights.");
        }

        console.warn(`Primary endpoint failed with status: ${response.status}`);
        const fallbackResponse = await fetch(`${API}/api/analytics`, requestInit);

        if (!fallbackResponse.ok) {
            throw new Error(`API endpoints unavailable. Primary: ${response.status}, Fallback: ${fallbackResponse.status}`);
        }

        const fallbackData = await fallbackResponse.json();
        console.log("Fallback data received:", fallbackData);
        return Array.isArray(fallbackData) ? fallbackData : (fallbackData.data ?? fallbackData.kpis ?? []);
    } catch (error) {
        console.error("Insights fetch error:", error);
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error(`Cannot connect to API at ${API}. Is the backend running?`);
        }
        throw error;
    }
}
