import Link from "next/link";
import { getAuthenticatedEmail } from "@/lib/auth-utils";

export default async function WelcomePage() {
	const email = await getAuthenticatedEmail();
	const isAuthenticated = email !== null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-zinc-900 dark:to-black flex items-center justify-center p-4">
			<div className="max-w-2xl w-full text-center">
				<div className="mb-8">
					<h1 className="text-5xl md:text-6xl font-bold text-black dark:text-zinc-50 mb-4">
						Welcome to Lunover
					</h1>
					<p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-8">
						No one knows what is going on here.
					</p>
				</div>

				<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 md:p-12 mb-8">
					<p className="text-lg text-zinc-700 dark:text-zinc-300 mb-8">
						Access the dashboard or explore the website
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							href={isAuthenticated ? "/" : "/login"}
							className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
						>
							{isAuthenticated ? "See Whatever" : "Login to Whatever"}
						</Link>

						<a
							href="https://lunover.com"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
						>
							Visit the Website
						</a>
					</div>
				</div>

				<div className="text-sm text-zinc-500 dark:text-zinc-500">
					<p>© {new Date().getFullYear()} Lunover. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
