import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export function GoogleSignUp() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome to SHADCN-ADMIN
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign up to continue
          </p>
        </div>

        <Button
          variant="outline"
          className="h-12 w-full gap-3"
        >
          <FcGoogle size={22} />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}