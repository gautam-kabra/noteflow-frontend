import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NoteFlow",
  description: "A fast, minimal, and professional note-taking application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}>
        <AuthProvider>
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              className: 'text-sm font-medium rounded-lg border border-zinc-800 shadow-lg',
              style: {
                background: '#18181b',
                color: '#f4f4f5',
              },
            }} 
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
