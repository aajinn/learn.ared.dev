import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Learn From Ared!",
  description: "Learn tech from Ared",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
