import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "İzin Defteri",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hydtration uyarısını önlemek için suppressHydrationWarning ekleniyor
  
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300`} 
      suppressHydrationWarning>
        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>

      </body>
    </html>
  );
}