export type InspectionStatus = "Passed" | "Failed" | "Awaiting Inspection";

export type Employee = {
  id: string;
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense?: string | null;
};

export type Vehicle = {
  id?: string;
  vehicle: string;
  numberPlate?: string;
  status: InspectionStatus;
};

export type Site = {
  id: string;
  name: string;
  location: string;
};
