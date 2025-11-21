import { Shield } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3" data-testid="navbar-logo">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-app-title">Fraud Detection System</h1>
            <p className="text-xs text-muted-foreground">Blockchain Trust Scoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" data-testid="network-status">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" data-testid="indicator-network-active" />
            <span className="text-sm text-muted-foreground">Network Active</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
