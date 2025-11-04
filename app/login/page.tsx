"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const error = searchParams.get("error");
	const errorMessages: Record<string, string> = {
		missing_token: "Invalid link. Please request a new magic link.",
		invalid_token:
			"This link has expired or is invalid. Please request a new one.",
		email_mismatch: "Email mismatch. Please request a new magic link.",
		verification_failed: "Verification failed. Please try again.",
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			const response = await fetch("/api/auth/send-link", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (data.success) {
				setMessage({
					type: "success",
					text: "Check your email! We've sent you a magic link to sign in.",
				});
				setEmail("");
			} else {
				setMessage({
					type: "error",
					text: data.error || "Failed to send magic link. Please try again.",
				});
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: "An error occurred. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardContent className="px-10">
					<div className="mb-4">
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
						>
							<Link href="/welcome">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Welcome
							</Link>
						</Button>
					</div>
					<CardHeader className="p-0 mb-6">
						<CardTitle className="text-3xl">Hey There!</CardTitle>
						<CardDescription className="text-base">
							Sign in with your email to access whatever is there.
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline-block"
							>
								Email Address
							</label>
							{/** biome-ignore lint/correctness/useUniqueElementIds: Not needed for this use case */}
							<Input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								placeholder="your.email@example.com"
							/>
						</div>

						<Button type="submit" disabled={isLoading} className="w-full">
							{isLoading ? (
								<>
									<Loader2 className="animate-spin h-5 w-5 mr-2" />
									Sending...
								</>
							) : (
								"Send Magic Link"
							)}
						</Button>
					</form>

					{error && (
						<Alert variant="destructive" className="mt-4">
							<AlertDescription>
								{errorMessages[error] || "An error occurred. Please try again."}
							</AlertDescription>
						</Alert>
					)}

					{message && (
						<Alert
							variant={message.type === "success" ? "default" : "destructive"}
							className="mt-4"
						>
							<AlertDescription>{message.text}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
					<div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
				</div>
			}
		>
			<LoginForm />
		</Suspense>
	);
}
