"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
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
			<div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-md w-full">
				<div className="mb-4">
					<Link
						href="/welcome"
						className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-2"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back to Welcome
					</Link>
				</div>
				<h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-2">
					Hey There!
				</h1>
				<p className="text-zinc-600 dark:text-zinc-400 mb-6">
					Sign in with your email to access whatever is there.
				</p>

				{error && (
					<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p className="text-sm text-red-700 dark:text-red-400">
							{errorMessages[error] || "An error occurred. Please try again."}
						</p>
					</div>
				)}

				{message && (
					<div
						className={`mb-4 p-4 rounded-lg ${
							message.type === "success"
								? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
								: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
						}`}
					>
						<p
							className={`text-sm ${
								message.type === "success"
									? "text-green-700 dark:text-green-400"
									: "text-red-700 dark:text-red-400"
							}`}
						>
							{message.text}
						</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
						>
							Email Address
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
							className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="your.email@example.com"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
					>
						{isLoading ? (
							<>
								<svg
									className="animate-spin h-5 w-5"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Sending...
							</>
						) : (
							"Send Magic Link"
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
