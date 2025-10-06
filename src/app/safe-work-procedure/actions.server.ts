"use server";

import { ActionResponse } from "@/types/action-response";
import { SafeWorkProcedureOutput } from "@/types/safe-work-procedure";

/**
 * Generates a Safe Work Procedure.
 * Replace the fake logic with AI/PDF/Firebase integration as needed.
 */
export async function generateSwpAction(args: {
  values: { clientName: string; taskDescription: string };
  userId: string;
}): Promise<ActionResponse<SafeWorkProcedureOutput>> {
  try {
    const { clientName, taskDescription } = args.values;

    const procedureText = `Safe Work Procedure for ${clientName}\n\nTask: ${taskDescription}\n\n1. Identify hazards.\n2. Wear PPE.\n3. Follow safety rules.\n4. Report incidents immediately.`;

    const result: SafeWorkProcedureOutput = { procedure: procedureText };

    return {
      success: true,
      data: result,
      storagePath: `/generated/swp/${args.userId}-${Date.now()}.pdf`,
    };
  } catch (err) {
    console.error("Error in generateSwpAction:", err);
    return {
      success: false,
      error: "Failed to generate Safe Work Procedure",
    };
  }
}
