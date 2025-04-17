import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  allowedUserType?: "client" | "provider" | "both";
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedUserType = "both"
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check user type access rights
  if (
    allowedUserType !== "both" && 
    user.userType !== allowedUserType
  ) {
    return (
      <Route path={path}>
        <Redirect to={user.userType === "client" ? "/" : "/provider/dashboard"} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
