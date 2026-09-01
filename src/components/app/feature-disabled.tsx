"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function FeatureDisabled({ feature }: { feature: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-3 p-8">
          <span className="rounded-full bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </span>
          <h2 className="font-display text-2xl font-bold">{feature} is turned off</h2>
          <p className="text-muted-foreground">
            A grown-up has paused this area for now. You can still explore the other
            rooms!
          </p>
          <Link href="/home" className={buttonVariants({ variant: "default" })}>
            Back home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
