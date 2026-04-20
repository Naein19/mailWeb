import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ToastContainer } from "@/components/toast-container"
import { ComposerPanel } from "@/components/composer-panel"

export const metadata: Metadata = {
  title: "Cluex - Email Clustering Platform",
  description: "AI-powered email clustering and management for smart teams",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>C</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark">
        <AuthProvider>
          {children}
        </AuthProvider>
        <ToastContainer />
        <ComposerPanel />
      </body>
    </html>
  )
}
