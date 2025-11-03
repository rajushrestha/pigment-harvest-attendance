"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function RefetchRedirectHandler() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const refetch = searchParams.get("refetch");
		if (refetch === "true") {
			// Remove refetch parameter from URL
			const params = new URLSearchParams(searchParams.toString());
			params.delete("refetch");
			const queryString = params.toString();
			router.replace(queryString ? `/?${queryString}` : "/");
		}
	}, [searchParams, router]);

	return null;
}
