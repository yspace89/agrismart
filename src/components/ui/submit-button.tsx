"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  pendingText?: string;
  children: React.ReactNode;
}

export function SubmitButton({ pendingText, children, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending || disabled} 
      aria-disabled={pending || disabled} 
      {...props}
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {pendingText || children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
