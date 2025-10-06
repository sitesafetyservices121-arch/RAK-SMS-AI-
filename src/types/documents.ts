
import { Timestamp } from "firebase/firestore";

export type Document = {
  id: string;
  name: string;
  category: string;
  section: string;
  subSection?: string;
  version: string;
  lastUpdated?: Date;
  updatedAt: Timestamp;
  type?: string;
  downloadURL?: string;
  url?: string;
  fileName?: string;
  status?: string;
  companyId?: string;
};
