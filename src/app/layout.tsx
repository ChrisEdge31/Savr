import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Savr — Budget Smarter, Compete Together",
	description: "Track your budget, set goals, and compete on the leaderboard.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={cn(
				"h-full antialiased",
				geistSans.variable,
				geistMono.variable,
				jetbrainsMono.variable,
			)}
		>
			<body className="min-h-full flex flex-col">
				<AuthProvider>
					{children}
					<Toaster richColors position="top-right" />
				</AuthProvider>
			</body>
		</html>
	);
}
