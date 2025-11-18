import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../externaluicomponents/Card.tsx";
import { Building2, Lock, Mail, Loader2 } from 'lucide-react';
import { useState } from "react";

const STRAPI_URL = "http://localhost:3001";

function LoginPage() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Reset state before new attempt
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: email, // Strapi uses 'identifier' for either email or username
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login Successful!", data.user);

                localStorage.setItem('jwt', data.jwt);

                localStorage.setItem('user', JSON.stringify(data.user));


                alert("Login successful! Token saved. Redirecting...");

            } else {
                // Login failed (e.g., invalid credentials)
                console.error("Login failed:", data.error.message);
                setError(data.error.message || "An unknown error occurred during login.");
            }
        } catch (err) {
            console.error("Network error:", err);
            setError("Cannot connect to the server. Check your API URL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-3xl">NabdTwin</CardTitle>
                            <CardDescription className="mt-2">
                                Organizational Visualization Platform
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Message Display */}
                            {error && (
                                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="user@nabdtwin.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">for further inquires please contact :</p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                <li>• Admin: eng.ramimoha@gmail.com</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default LoginPage;