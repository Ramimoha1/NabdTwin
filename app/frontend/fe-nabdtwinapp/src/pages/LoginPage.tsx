import {Card ,CardContent , CardHeader, CardTitle ,CardDescription} from "../externaluicomponents/Card.tsx";
import { Building2, Lock, Mail } from 'lucide-react';
import {useState} from "react";

function LoginPage() {
    const [password,setPassword] = useState("")
    const [email,setEmail] = useState("")
    const handleSubmit = () => {
        console.log("submitted")
    }
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
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full">
                                Sign In
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