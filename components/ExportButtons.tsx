"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { FileDown, Download, Loader2 } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";

interface ExportButtonsProps {
	tableRef: React.RefObject<HTMLDivElement>;
	legendRef: React.RefObject<HTMLDivElement>;
	month: string;
	year: number;
}

export function ExportButtons({
	tableRef,
	legendRef,
	month,
	year,
}: ExportButtonsProps) {
	const [isExportingPDF, setIsExportingPDF] = useState(false);
	const [isExportingCSV, setIsExportingCSV] = useState(false);
	const [refsReady, setRefsReady] = useState(false);

	// Check if refs are available reactively
	useEffect(() => {
		const checkRefs = () => {
			setRefsReady(!!(tableRef.current && legendRef.current));
		};

		checkRefs();

		// Check periodically until refs are ready
		const interval = setInterval(() => {
			if (tableRef.current && legendRef.current) {
				setRefsReady(true);
				clearInterval(interval);
			}
		}, 100);

		// Cleanup after 5 seconds max
		const timeout = setTimeout(() => {
			clearInterval(interval);
		}, 5000);

		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
		};
	}, [tableRef, legendRef]);

	const exportToPDF = async () => {
		if (!tableRef.current || !legendRef.current) {
			console.error("Refs not ready");
			return;
		}

		setIsExportingPDF(true);
		try {
			// Helper function to convert any color format to RGB
			const convertToRGB = (
				color: string,
				useFor: "color" | "background" = "color",
			): string | null => {
				if (!color || color === "transparent") return null;
				if (color.startsWith("rgb")) return color;

				// Create temporary element to get computed RGB
				const temp = document.createElement("div");
				if (useFor === "background") {
					temp.style.backgroundColor = color;
				} else {
					temp.style.color = color;
				}
				temp.style.position = "absolute";
				temp.style.visibility = "hidden";
				temp.style.opacity = "0";
				document.body.appendChild(temp);
				const computedStyle = window.getComputedStyle(temp);
				const rgb =
					useFor === "background"
						? computedStyle.backgroundColor
						: computedStyle.color;
				document.body.removeChild(temp);

				return rgb?.startsWith("rgb") ? rgb : null;
			};

			// Helper function to convert all colors in an element tree to RGB
			const convertElementColorsToRGB = (element: HTMLElement) => {
				const computedStyle = window.getComputedStyle(element);

				// Convert all color-related properties
				const colorProperties = [
					{ prop: "backgroundColor", styleProp: "backgroundColor" },
					{ prop: "color", styleProp: "color" },
					{ prop: "borderColor", styleProp: "borderColor" },
					{ prop: "borderTopColor", styleProp: "borderTopColor" },
					{ prop: "borderRightColor", styleProp: "borderRightColor" },
					{ prop: "borderBottomColor", styleProp: "borderBottomColor" },
					{ prop: "borderLeftColor", styleProp: "borderLeftColor" },
					{ prop: "outlineColor", styleProp: "outlineColor" },
				];

				colorProperties.forEach(({ prop, styleProp }) => {
					const value = computedStyle.getPropertyValue(prop);
					if (
						value &&
						value !== "rgba(0, 0, 0, 0)" &&
						value !== "transparent"
					) {
						const useFor = prop === "backgroundColor" ? "background" : "color";
						const rgb = convertToRGB(value, useFor);
						if (rgb) {
							element.style.setProperty(
								styleProp.replace(/([A-Z])/g, "-$1").toLowerCase(),
								rgb,
								"important",
							);
						}
					}
				});

				// Process all children
				Array.from(element.children).forEach((child) => {
					convertElementColorsToRGB(child as HTMLElement);
				});
			};

			// Create a container that includes both table and legend
			const container = document.createElement("div");
			container.style.position = "absolute";
			container.style.left = "-9999px";
			container.style.width = "fit-content";
			container.style.maxWidth = "none";
			container.style.backgroundColor = "rgb(255, 255, 255)";
			container.style.padding = "20px";
			container.style.overflow = "visible";

			// Clone the table container
			const tableClone = tableRef.current.cloneNode(true) as HTMLElement;
			// Remove sticky positioning for export and ensure table fits
			const table = tableClone.querySelector("table");
			if (table) {
				const stickyElements = table.querySelectorAll("[class*='sticky']");
				stickyElements.forEach((el) => {
					el.classList.remove("sticky");
					(el as HTMLElement).style.position = "static";
				});
				// Ensure table doesn't get cut off
				(table as HTMLElement).style.width = "auto";
				(table as HTMLElement).style.maxWidth = "none";
				(table as HTMLElement).style.tableLayout = "auto";
			}
			// Ensure the wrapper div also allows full width
			tableClone.style.width = "fit-content";
			tableClone.style.maxWidth = "none";
			tableClone.style.overflow = "visible";

			// Clone the legend
			const legendClone = legendRef.current.cloneNode(true) as HTMLElement;

			container.appendChild(tableClone);
			container.appendChild(legendClone);
			document.body.appendChild(container);

			// Wait for elements to be in DOM and styles to compute
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Convert all colors to RGB BEFORE html2canvas processes them
			convertElementColorsToRGB(tableClone);
			convertElementColorsToRGB(legendClone);

			// Wait for styles to apply and layout to stabilize
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Get actual dimensions after layout
			const containerWidth = Math.max(
				container.scrollWidth,
				container.offsetWidth,
			);
			const containerHeight = Math.max(
				container.scrollHeight,
				container.offsetHeight,
			);

			// Convert to canvas with onclone to handle any remaining lab() colors
			const canvas = await html2canvas(container, {
				scale: 1.5,
				useCORS: true,
				backgroundColor: "#ffffff",
				logging: false,
				allowTaint: false,
				width: containerWidth,
				height: containerHeight,
				windowWidth: containerWidth,
				windowHeight: containerHeight,
				scrollX: 0,
				scrollY: 0,
				onclone: (clonedDoc) => {
					// Remove ALL stylesheets and style tags that might contain lab() colors
					// This is critical - html2canvas reads stylesheets directly and can't parse lab()
					const stylesheets = clonedDoc.querySelectorAll(
						"style, link[rel='stylesheet']",
					);
					stylesheets.forEach((sheet) => {
						sheet.remove();
					});

					// Also remove stylesheets from the head
					const head = clonedDoc.head;
					if (head) {
						const headStyles = head.querySelectorAll(
							"style, link[rel='stylesheet']",
						);
						headStyles.forEach((sheet) => {
							sheet.remove();
						});
					}

					// Also try to remove stylesheets from the main document that html2canvas might access
					// This is a workaround for html2canvas accessing main document stylesheets
					try {
						const mainStylesheets = document.querySelectorAll(
							"style, link[rel='stylesheet']",
						);
						const removedSheets: HTMLElement[] = [];
						mainStylesheets.forEach((sheet) => {
							if (sheet.parentNode) {
								sheet.parentNode.removeChild(sheet);
								removedSheets.push(sheet as HTMLElement);
							}
						});

						// Restore stylesheets after a short delay (in case html2canvas needs them)
						setTimeout(() => {
							removedSheets.forEach((sheet) => {
								document.head.appendChild(sheet);
							});
						}, 100);
					} catch {
						// Ignore errors
					}

					// Convert all colors to RGB in the cloned document
					const allElements = clonedDoc.querySelectorAll("*");
					allElements.forEach((el) => {
						const htmlEl = el as HTMLElement;
						const win = clonedDoc.defaultView || window;
						if (!win) return;

						const computedStyle = win.getComputedStyle(htmlEl);

						// Convert background color
						const bgColor = computedStyle.backgroundColor;
						if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
							if (!bgColor.startsWith("rgb")) {
								try {
									const temp = clonedDoc.createElement("div");
									temp.style.backgroundColor = bgColor;
									temp.style.position = "absolute";
									temp.style.visibility = "hidden";
									clonedDoc.body.appendChild(temp);
									const rgb = win.getComputedStyle(temp).backgroundColor;
									clonedDoc.body.removeChild(temp);
									if (rgb?.startsWith("rgb")) {
										htmlEl.style.backgroundColor = rgb;
									}
								} catch {
									htmlEl.style.backgroundColor = "transparent";
								}
							}
						}

						// Convert text color
						const textColor = computedStyle.color;
						if (textColor && !textColor.startsWith("rgb")) {
							try {
								const temp = clonedDoc.createElement("div");
								temp.style.color = textColor;
								temp.style.position = "absolute";
								temp.style.visibility = "hidden";
								clonedDoc.body.appendChild(temp);
								const rgb = win.getComputedStyle(temp).color;
								clonedDoc.body.removeChild(temp);
								if (rgb?.startsWith("rgb")) {
									htmlEl.style.color = rgb;
								}
							} catch {
								htmlEl.style.color = "rgb(0, 0, 0)";
							}
						}

						// Convert border color
						const borderColor = computedStyle.borderColor;
						if (
							borderColor &&
							borderColor !== "rgba(0, 0, 0, 0)" &&
							!borderColor.startsWith("rgb")
						) {
							try {
								const temp = clonedDoc.createElement("div");
								temp.style.borderColor = borderColor;
								temp.style.position = "absolute";
								temp.style.visibility = "hidden";
								clonedDoc.body.appendChild(temp);
								const rgb = win.getComputedStyle(temp).borderColor;
								clonedDoc.body.removeChild(temp);
								if (rgb?.startsWith("rgb")) {
									htmlEl.style.borderColor = rgb;
								}
							} catch {
								htmlEl.style.borderColor = "rgb(0, 0, 0)";
							}
						}
					});
				},
			});

			// Remove temporary container
			document.body.removeChild(container);

			// Create PDF in landscape A4
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({
				orientation: "landscape",
				unit: "mm",
				format: "a4",
			});

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			const imgWidth = canvas.width;
			const imgHeight = canvas.height;

			// Calculate ratio to fit the image within the page
			// Leave some margin for the title
			const marginTop = 15; // Space for title
			const margin = 10; // Side margins
			const availableWidth = pdfWidth - margin * 2;
			const availableHeight = pdfHeight - marginTop - margin;

			const widthRatio = availableWidth / imgWidth;
			const heightRatio = availableHeight / imgHeight;
			const ratio = Math.min(widthRatio, heightRatio, 1); // Don't scale up

			const imgScaledWidth = imgWidth * ratio;
			const imgScaledHeight = imgHeight * ratio;

			// Center the image horizontally
			const xOffset = (pdfWidth - imgScaledWidth) / 2;

			// Add title
			pdf.setFontSize(16);
			pdf.text(
				`Monthly Attendance Sheet - ${month} ${year}`,
				pdfWidth / 2,
				10,
				{
					align: "center",
				},
			);

			// Add image to PDF
			pdf.addImage(
				imgData,
				"PNG",
				xOffset,
				marginTop,
				imgScaledWidth,
				imgScaledHeight,
			);

			// Save PDF
			pdf.save(`Attendance-${month}-${year}.pdf`);
		} catch (error) {
			console.error("Error exporting to PDF:", error);
			alert("Failed to export PDF. Please try again.");
		} finally {
			setIsExportingPDF(false);
		}
	};

	const exportToCSV = () => {
		if (!tableRef.current) {
			console.error("Table ref not ready");
			return;
		}

		setIsExportingCSV(true);
		try {
			const table = tableRef.current.querySelector("table");
			if (!table) {
				console.error("Table element not found");
				setIsExportingCSV(false);
				return;
			}

			const rows: string[] = [];
			const allRows = table.querySelectorAll("tr");

			allRows.forEach((row) => {
				const rowData: string[] = [];
				const cells = row.querySelectorAll("th, td");

				cells.forEach((cell) => {
					// Get text content, handling nested divs
					const text = cell.textContent?.trim() || "";
					// Escape quotes and wrap in quotes if contains comma or newline
					const escaped = text.replace(/"/g, '""');
					rowData.push(`"${escaped}"`);
				});

				rows.push(rowData.join(","));
			});

			// Add legend information
			rows.push("");
			rows.push('"Legend:"');
			rows.push('"Holiday","Purple background"');
			rows.push('"Weekend","Red background"');
			rows.push(
				'"Worked","Green background (intensity based on hours worked)"',
			);
			rows.push('"Absent","Light red background (0h on working day)"');

			const csvContent = rows.join("\n");
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);

			link.setAttribute("href", url);
			link.setAttribute("download", `Attendance-${month}-${year}.csv`);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error exporting to CSV:", error);
			alert("Failed to export CSV. Please try again.");
		} finally {
			setIsExportingCSV(false);
		}
	};

	return (
		<ButtonGroup>
			<Button
				type="button"
				onClick={exportToPDF}
				disabled={isExportingPDF || !refsReady}
				variant="outline"
				size="sm"
				title="Export as PDF"
			>
				{isExportingPDF ? <Loader2 className="animate-spin" /> : <FileDown />}
				<span>{isExportingPDF ? "Exporting..." : "Export PDF"}</span>
			</Button>
			<Button
				type="button"
				onClick={exportToCSV}
				disabled={isExportingCSV || !refsReady}
				variant="outline"
				size="sm"
				title="Export as Google Sheets (CSV)"
			>
				{isExportingCSV ? <Loader2 className="animate-spin" /> : <Download />}
				<span>{isExportingCSV ? "Exporting..." : "Export CSV"}</span>
			</Button>
		</ButtonGroup>
	);
}
