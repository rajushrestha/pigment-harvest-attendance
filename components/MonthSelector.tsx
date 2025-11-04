"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ButtonGroup } from "./ui/button-group";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Kbd } from "./ui/kbd";

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export function MonthSelector() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [monthPopoverOpen, setMonthPopoverOpen] = useState(false);
	const [yearPopoverOpen, setYearPopoverOpen] = useState(false);

	const today = new Date();
	const monthParam = searchParams.get("month");
	const yearParam = searchParams.get("year");
	const currentMonth = monthParam ? parseInt(monthParam) : today.getMonth();
	const currentYear = yearParam ? parseInt(yearParam) : today.getFullYear();

	const handleMonthChange = (month: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("month", month.toString());
		params.set("year", currentYear.toString());
		router.push(`?${params.toString()}`);
		setMonthPopoverOpen(false);
	};

	const handleYearChange = (year: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("month", currentMonth.toString());
		params.set("year", year.toString());
		router.push(`?${params.toString()}`);
		setYearPopoverOpen(false);
	};

	const handlePreviousMonth = () => {
		let newMonth = currentMonth - 1;
		let newYear = currentYear;

		if (newMonth < 0) {
			newMonth = 11;
			newYear = currentYear - 1;
		}

		const params = new URLSearchParams(searchParams.toString());
		params.set("month", newMonth.toString());
		params.set("year", newYear.toString());
		router.push(`?${params.toString()}`);
	};

	const handleNextMonth = () => {
		let newMonth = currentMonth + 1;
		let newYear = currentYear;

		if (newMonth > 11) {
			newMonth = 0;
			newYear = currentYear + 1;
		}

		const params = new URLSearchParams(searchParams.toString());
		params.set("month", newMonth.toString());
		params.set("year", newYear.toString());
		router.push(`?${params.toString()}`);
	};

	// Add keyboard shortcuts for Command+Left and Command+Right
	useHotkeys(
		"meta+arrowleft",
		(e) => {
			e.preventDefault();
			handlePreviousMonth();
		},
		{ enableOnFormTags: false },
	);

	useHotkeys(
		"meta+arrowright",
		(e) => {
			e.preventDefault();
			handleNextMonth();
		},
		{ enableOnFormTags: false },
	);

	// Generate year options (current year ± 2 years)
	const currentYearNum = today.getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYearNum - 4 + i + 1);

	return (
		<div className="flex items-center gap-3 flex-wrap">
			<ButtonGroup>
				<ButtonGroup className="hidden sm:flex">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								onClick={handlePreviousMonth}
							>
								<ArrowLeftIcon />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Previous Month <Kbd>⌘ ←</Kbd>
							</p>
						</TooltipContent>
					</Tooltip>
				</ButtonGroup>
				<ButtonGroup>
					<Popover open={monthPopoverOpen} onOpenChange={setMonthPopoverOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline">{monthNames[currentMonth]}</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[140px] p-1" align="start">
							<div className="max-h-[200px] overflow-y-auto">
								{monthNames.map((month, index) => (
									<Button
										key={month}
										variant={index === currentMonth ? "secondary" : "ghost"}
										className="w-full justify-start"
										onClick={() => handleMonthChange(index)}
									>
										{month}
									</Button>
								))}
							</div>
						</PopoverContent>
					</Popover>
					<Popover open={yearPopoverOpen} onOpenChange={setYearPopoverOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline">{currentYear}</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[100px] p-1" align="start">
							<div className="max-h-[200px] overflow-y-auto">
								{years.map((year) => (
									<Button
										key={year}
										variant={year === currentYear ? "secondary" : "ghost"}
										className="w-full justify-start"
										onClick={() => handleYearChange(year)}
									>
										{year}
									</Button>
								))}
							</div>
						</PopoverContent>
					</Popover>
				</ButtonGroup>
				<ButtonGroup className="hidden sm:flex">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="icon" onClick={handleNextMonth}>
								<ArrowRightIcon />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Next Month <Kbd>⌘ →</Kbd>
							</p>
						</TooltipContent>
					</Tooltip>
				</ButtonGroup>
			</ButtonGroup>
		</div>
	);
}
