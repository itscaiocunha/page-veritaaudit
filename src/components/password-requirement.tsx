import { Check, X } from "lucide-react";

interface Props {
  password: string;
}

const PasswordRequirement = ({ password }: Props) => {
  const requirements = [
    {
      label: "Mínimo 8 caracteres",
      valid: (password || "").length >= 8,
    },
    {
      label: "Uma letra maiúscula",
      valid: /[A-Z]/.test(password || ""),
    },
    {
      label: "Uma letra minúscula",
      valid: /[a-z]/.test(password || ""),
    },
    {
      label: "Um número",
      valid: /[0-9]/.test(password || ""),
    },
  ];  

  return (
    <div className="space-y-1 text-sm text-gray-600">
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {req.valid ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <X className="w-4 h-4 text-red-500" />
          )}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirement;
