"use client";

import { useFormStatus } from "react-dom";

type FormStatusButtonProps = {
  label: string;
  pendingLabel: string;
  className: string;
};

export function FormStatusButton({
  label,
  pendingLabel,
  className,
}: FormStatusButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
