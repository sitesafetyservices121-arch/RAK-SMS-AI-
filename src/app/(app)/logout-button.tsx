"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to log out');
            }

            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
            
            // Full page refresh to clear state and redirect via middleware
            window.location.href = '/login';

        } catch (error) {
            console.error("Logout failed:", error);
            toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description: 'Could not log you out. Please try again.',
            });
        }
    };

    return (
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
        </DropdownMenuItem>
    );
}
