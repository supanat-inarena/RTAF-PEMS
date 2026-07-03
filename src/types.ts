export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "pilot" | "supply" | "commander" | "executive" | "admin";
  rank?: string;
  createdAt: string;
}

export interface EquipmentRequest {
  id: string;
  pilotId: string;
  pilotName: string;
  pilotRank?: string;
  category: "Helmet" | "G-Suit" | "Oxygen Mask";
  quantity: number;
  reason: string;
  status: "pending" | "verified" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  approvedBy?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  nsn: string;
  category: "Helmet" | "G-Suit" | "Oxygen Mask";
  quantity: number;
  reorderPoint: number;
  expiryDate?: string;
  status: "normal" | "expired" | "critical";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: "SUCCESS" | "FAILED";
}
