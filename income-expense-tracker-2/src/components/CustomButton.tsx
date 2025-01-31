import { Button } from "@/components/ui/button";

interface CustomButtonProps {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "destructive";
}

export default function CustomButton({ label, onClick, variant = "default" }: CustomButtonProps) {
    return (
        <Button variant={variant} onClick={onClick}>
            {label}
        </Button>
    );
}
