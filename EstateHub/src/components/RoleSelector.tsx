import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, ShoppingBag, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
}

const roles = [
  {
    value: "buyer",
    label: "Buyer",
    description: "Looking to purchase properties",
    icon: Home,
    color: "text-blue-500",
  },
  {
    value: "builder",
    label: "Builder",
    description: "List and manage properties",
    icon: Building2,
    color: "text-orange-500",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Browse and save favorites",
    icon: ShoppingBag,
    color: "text-green-500",
  },
];

export const RoleSelector = ({ selectedRole, onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Your Role</h3>
        <p className="text-sm text-muted-foreground">Choose how you'll use the platform</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card
              key={role.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedRole === role.value && "ring-2 ring-primary"
              )}
              onClick={() => onRoleSelect(role.value)}
            >
              <CardHeader className="text-center">
                <Icon className={cn("h-12 w-12 mx-auto mb-2", role.color)} />
                <CardTitle className="text-lg">{role.label}</CardTitle>
                <CardDescription className="text-xs">{role.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
