import { TriangleAlertIcon } from "lucide-react";

interface formErrorProps {
  message?: string | undefined;
}

export const FormError = ({ message }: formErrorProps) => {
  if (!message) return null;

  return (
    <div className=" flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <TriangleAlertIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
