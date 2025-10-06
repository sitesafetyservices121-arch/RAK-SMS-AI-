export type BillingStatus = "Active" | "Suspended" | "Trial" | "Past Due";

export type BillingAccount = {
  id: string;
  companyName: string;
  primaryContact: string;
  userCount: number;
  status: BillingStatus;
  subscriptionPlan: string;
  lastPaymentDate?: string;
  nextPaymentDue?: string;
  balanceDue: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
};
