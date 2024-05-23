'use client';
import Link from "next/link";
import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { Loader2 } from 'lucide-react';
import { signIn } from "@/lib/user-actions"; // Ensure this path is correct

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget as HTMLFormElement);

        try {
            // Await the response from signIn directly
            await signIn(formData);
            // Handle successful login, e.g., redirect to dashboard
        } catch (err) {
            setError('Incorrect email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto w-[350px]">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="ml-auto inline-block text-sm underline">
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Login'
                            )}
                        </Button>
                        <SignInWithGoogleButton />
                    </div>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/sign-up" className="underline">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
