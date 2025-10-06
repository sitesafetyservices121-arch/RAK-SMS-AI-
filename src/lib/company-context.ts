export type CompanyIdentifiers = {
  companyId?: string | null;
  companyName?: string | null;
  userId?: string | null;
};

export type EnsureCompanyIdentifiersOptions = {
  requireCompanyName?: boolean;
  requireUserId?: boolean;
  context?: string;
};

export type EnsuredCompanyIdentifiers = {
  companyId: string;
  companyName?: string;
  userId?: string;
};

export function ensureCompanyIdentifiers(
  identifiers: CompanyIdentifiers,
  {
    requireCompanyName = true,
    requireUserId = true,
    context = "Company context",
  }: EnsureCompanyIdentifiersOptions = {}
): EnsuredCompanyIdentifiers {
  const missingFields: string[] = [];

  const trimmedCompanyId = identifiers.companyId?.trim();
  if (!trimmedCompanyId) {
    missingFields.push("companyId");
  }

  const trimmedCompanyName = identifiers.companyName?.trim();
  if (requireCompanyName && !trimmedCompanyName) {
    missingFields.push("companyName");
  }

  const trimmedUserId = identifiers.userId?.trim();
  if (requireUserId && !trimmedUserId) {
    missingFields.push("userId");
  }

  if (missingFields.length > 0) {
    const list = missingFields.join(", ");
    throw new Error(`${context} is missing required field(s): ${list}.`);
  }

  return {
    companyId: trimmedCompanyId!,
    companyName: trimmedCompanyName ?? undefined,
    userId: trimmedUserId ?? undefined,
  };
}

export function ensureActionCompanyScope(
  identifiers: CompanyIdentifiers,
  context = "Action input"
): { companyId: string; companyName: string; userId: string } {
  const scoped = ensureCompanyIdentifiers(identifiers, {
    context,
    requireCompanyName: true,
    requireUserId: true,
  });

  return {
    companyId: scoped.companyId,
    companyName: scoped.companyName!,
    userId: scoped.userId!,
  };
}

export function ensureCompanyId(
  companyId: string | null | undefined,
  context = "Company context"
): string {
  return ensureCompanyIdentifiers(
    { companyId },
    { context, requireCompanyName: false, requireUserId: false }
  ).companyId;
}
