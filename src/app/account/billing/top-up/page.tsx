"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LoadingDots from "@/components/ui/loading-dots";
import { generatePayFastSignatureAction } from "./actions";
import { CreditCard } from "lucide-react";

const formSchema = z.object({
  amount: z.coerce
    .number()
    .min(5, "Amount must be at least R5.00")
    .max(1000000, "Amount is too large"),
  itemName: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name is too long"),
});

type PayFastFormData = {
  [key: string]: string;
};

export default function TopUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 500,
      itemName: "RAK-SMS Subscription Top-up",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const paymentData = {
        amount: values.amount.toFixed(2),
        item_name: values.itemName,
        email_address: "admin@rak-sms.co.za",
        name_first: "Admin",
        name_last: "User",
        m_payment_id: `RAK-${Date.now()}`,
      };

      const response = await generatePayFastSignatureAction(paymentData);

      if (response.success && response.data) {
        const payfastForm = document.createElement("form");
        payfastForm.method = "POST";
        payfastForm.action = "https://sandbox.payfast.co.za/eng/process";
        payfastForm.style.display = "none";

        const allData: PayFastFormData = {
          ...paymentData,
          ...response.data,
        };

        Object.entries(allData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          payfastForm.appendChild(input);
        });

        document.body.appendChild(payfastForm);
        payfastForm.submit();
      } else {
        toast({
          variant: "destructive",
          title: "Error Generating Payment",
          description: response.error || "Failed to generate payment signature",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Account Top-up</CardTitle>
          <CardDescription>
            Add funds to your account using PayFast secure payment gateway.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (ZAR)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="5"
                          className="pl-7"
                          placeholder="500.00"
                          disabled={isLoading}
                          value={field.value?.toString() ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., RAK-SMS Subscription"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <LoadingDots />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to PayFast
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                You will be redirected to PayFast to complete your payment
                securely.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
