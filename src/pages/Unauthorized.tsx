import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive" aria-hidden="true" />
      <h1 className="text-2xl font-bold">You don't have access to this page</h1>
      <p className="max-w-md text-muted-foreground">
        Your account doesn't have permission to view this area. If you think this is a mistake,
        contact an administrator.
      </p>
      <Button asChild>
        <Link to="/dashboard">Go to my dashboard</Link>
      </Button>
    </main>
  );
}
