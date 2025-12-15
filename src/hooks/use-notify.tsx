import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const useNotify = () => {
  const { toast } = useToast();

  return {
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        className: "bg-green-50 border-green-200 text-green-800",
        action: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      });
    },
    error: (title: string, description?: string) => {
      toast({
        variant: "destructive",
        title,
        description,
        action: <AlertCircle className="h-5 w-5 text-white" />,
      });
    },
    info: (title: string, description?: string) => {
      toast({
        title,
        description,
        className: "bg-green-50 border-green-200 text-green-800",
        action: <AlertCircle className="h-5 w-5 text-green-600" />,
      });
    }
  };
};