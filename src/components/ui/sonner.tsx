import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      gap={8}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.15)] group-[.toaster]:rounded-2xl group-[.toaster]:px-5 group-[.toaster]:py-4 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-accent group-[.toast]:text-accent-foreground group-[.toast]:rounded-full group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:px-4 group-[.toast]:h-8",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full",
          success:
            "group-[.toaster]:!border-accent/20 group-[.toaster]:!bg-card",
          error:
            "group-[.toaster]:!border-destructive/20 group-[.toaster]:!bg-card",
          warning:
            "group-[.toaster]:!border-yellow-500/20 group-[.toaster]:!bg-card",
          info:
            "group-[.toaster]:!border-blue-500/20 group-[.toaster]:!bg-card",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-accent" />,
        error: <XCircle className="w-5 h-5 text-destructive" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
