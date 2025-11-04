import Link from "next/link";
import { getAuthenticatedEmail } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function WelcomePage() {
	const email = await getAuthenticatedEmail();
	const isAuthenticated = email !== null;

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-zinc-900 dark:to-black flex items-center justify-center p-4">
			<div className="max-w-2xl w-full text-center">
				<h1 className="text-4xl md:text-5xl font-bold text-black dark:text-zinc-50 mb-4">
					Welcome
				</h1>

				<p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-8">
					No one knows what is going on here.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Button
						asChild
						size="lg"
						className="w-full sm:w-auto shadow-lg hover:shadow-xl"
					>
						<Link href={isAuthenticated ? "/" : "/login"}>
							{isAuthenticated ? "See Whatever" : "Login to Whatever"}
						</Link>
					</Button>

					<Button
						asChild
						variant="outline"
						size="lg"
						className="w-full sm:w-auto shadow-lg hover:shadow-xl"
					>
						<a
							href="https://lunover.com"
							target="_blank"
							rel="noopener noreferrer"
						>
							Visit the Website
						</a>
					</Button>
				</div>

				<div className="text-sm text-zinc-500 dark:text-zinc-500 pt-10">
					<p>© {new Date().getFullYear()} Lunover. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
