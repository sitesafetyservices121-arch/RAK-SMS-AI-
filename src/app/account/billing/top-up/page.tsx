
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
  amount: z.coerce.number().min(5, "Amount must be at least R5.00"),
  itemName: z.string().min(1, "Item name is required"),
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
    
    // In a real app, user details would come from the current session
    const paymentData = {
        amount: values.amount.toFixed(2),
        item_name: values.itemName,
        email_address: 'admin@rak-sms.co.za',
        name_first: 'Admin',
        name_last: 'User',
        m_payment_id: `RAK-${Date.now()}` // Example payment ID
    };

    const response = await generatePayFastSignatureAction(paymentData);

    if (response.success && response.data) {
        const payfastForm = document.createElement('form');
        payfastForm.method = 'POST';
        // Use sandbox URL for testing
        payfastForm.action = 'https://sandbox.payfast.co.za/eng/process';
        payfastForm.style.display = 'none';

        const allData: PayFastFormData = {
            ...paymentData,
            ...response.data,
        }

        for (const key in allData) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = allData[key];
            payfastForm.appendChild(input);
        }

        document.body.appendChild(payfastForm);
        payfastForm.submit();

    } else {
      toast({
        variant: "destructive",
        title: "Error Generating Payment",
        description: response.error,
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Account Top-up</CardTitle>
        <CardDescription>
          Add funds to your account using PayFast.
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
                    <Input type="number" step="0.01" {...field} />
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
                  <FormLabel>Payment For</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <LoadingDots /> : <CreditCard className="mr-2 h-4 w-4" />}
              Proceed to PayFast
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
