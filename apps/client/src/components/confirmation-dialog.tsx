import * as React from "react";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";

export interface ConfirmationDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  errorMessage?: string;
  tone?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmationDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  errorMessage = "The action could not be completed. Try again.",
  tone = "default",
  onConfirm,
}: ConfirmationDialogProps) {
  const [pending, setPending] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const confirm = async (close: () => void) => {
    setPending(true);
    setHasError(false);
    try {
      await onConfirm();
      close();
    } catch {
      setHasError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      dismissible={!pending}
      footer={({ close }) => (
        <>
          <Button type="button" variant="ghost" disabled={pending} onClick={close}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "primary"}
            loading={pending}
            onClick={() => void confirm(close)}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {children}
      {hasError ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </Dialog>
  );
}

export const AlertDialog = ConfirmationDialog;
