import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Panier" },
  { id: 2, label: "Adresse" },
  { id: 3, label: "Paiement" },
  { id: 4, label: "Confirmation" },
];

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav className="flex items-center justify-center gap-2 py-6">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 transition-colors",
              step.id < currentStep
                ? "bg-cowri-orange border-cowri-orange text-white"
                : step.id === currentStep
                ? "border-cowri-orange text-cowri-orange"
                : "border-muted text-muted-foreground"
            )}
          >
            {step.id < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              step.id
            )}
          </div>
          <span
            className={cn(
              "hidden md:inline ml-2 text-sm",
              step.id === currentStep
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "w-8 md:w-16 h-0.5 mx-2",
                step.id < currentStep ? "bg-cowri-orange" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
