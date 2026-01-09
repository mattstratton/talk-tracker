"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { authClient } from "~/server/better-auth/client";

export function SignInForm() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome to Talk Tracker</CardTitle>
        <CardDescription>
          Sign in with your Google account to track your conference talk
          proposals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={handleGoogleSignIn}
          type="button"
          variant="default"
        >
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
