import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc,
  writeBatch
} from "firebase/firestore";

// Firebase App Configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "sturdy-shield-94dh4",
  appId: "1:1048423909785:web:f8e3c699340d33ff5eeb08",
  apiKey: "AIzaSyC-rmWRaezPitCTQYF6yG3Py9OJ1TliYPo",
  authDomain: "sturdy-shield-94dh4.firebaseapp.com",
  storageBucket: "sturdy-shield-94dh4.firebasestorage.app",
  messagingSenderId: "1048423909785"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore using the custom database ID from config
export const db = getFirestore(app, "ai-studio-fd06e8e0-6022-4805-b275-cbfdb9aa4204");

// Validate Firestore Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Successfully connected to Firestore!");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration or connection.");
    } else {
      console.log("Connection verified with warning / empty db:", error);
    }
  }
}

// Seed initial database state if empty
export async function seedDatabaseIfEmpty() {
  try {
    const inventorySnapshot = await getDocs(collection(db, "inventory"));
    if (inventorySnapshot.empty) {
      console.log("Seeding inventory items...");
      const batch = writeBatch(db);
      
      const initialInventory = [
        {
          id: "item_oring",
          name: "O-Ring, Hydraulic Seal",
          nsn: "5330-01-123-4567",
          category: "Oxygen Mask",
          quantity: 24,
          reorderPoint: 50,
          expiryDate: "12 Dec 2026",
          status: "critical"
        },
        {
          id: "item_flight_suit",
          name: "Flight Suit, Size XL",
          nsn: "8415-01-518-4592",
          category: "G-Suit",
          quantity: 50,
          reorderPoint: 10,
          expiryDate: "15 May 2024",
          status: "normal"
        },
        {
          id: "item_circuit_breaker",
          name: "Circuit Breaker, 15A",
          nsn: "5925-00-058-2941",
          category: "Oxygen Mask",
          quantity: 2,
          reorderPoint: 5,
          expiryDate: "N/A",
          status: "critical"
        },
        {
          id: "item_engine_filter",
          name: "Engine Filter Element",
          nsn: "2915-01-209-3851",
          category: "Helmet",
          quantity: 12,
          reorderPoint: 20,
          expiryDate: "15 May 2024",
          status: "critical"
        }
      ];

      initialInventory.forEach((item) => {
        const ref = doc(db, "inventory", item.id);
        batch.set(ref, item);
      });

      await batch.commit();
      console.log("Seeded inventory successfully.");
    }

    const requestsSnapshot = await getDocs(collection(db, "requests"));
    if (requestsSnapshot.empty) {
      console.log("Seeding initial requests...");
      const batch = writeBatch(db);

      const initialRequests = [
        {
          id: "REQ-2024-089",
          pilotId: "somchai_pi",
          pilotName: "น.ท. สมชาย รักดี",
          pilotRank: "น.ท.",
          category: "G-Suit",
          quantity: 15,
          reason: "ชุดน่านฟ้าทางยุทธวิธี (Tactical Flight Suit v4) สำหรับฝูงบินที่ 4",
          status: "pending",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "REQ-2024-087",
          pilotId: "somchai_pi",
          pilotName: "น.ท. สมชาย รักดี",
          pilotRank: "น.ท.",
          category: "Helmet",
          quantity: 2,
          reason: "หมวกบินพร้อมระบบแสดงผล (HMD System) ชำรุดระหว่างฝึก",
          status: "approved",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
          approvedBy: "พล.อ.ท. ประสิทธิ์ ยอดบิน"
        },
        {
          id: "REQ-2024-085",
          pilotId: "somchai_pi",
          pilotName: "น.ท. สมชาย รักดี",
          pilotRank: "น.ท.",
          category: "Oxygen Mask",
          quantity: 40,
          reason: "ถังออกซิเจนฉุกเฉิน (Bailout Bottle) สำหรับกำลังพลสำรอง ฝูงบิน 7",
          status: "approved",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 3600000 * 46).toISOString(),
          approvedBy: "พล.อ.ท. ประสิทธิ์ ยอดบิน"
        }
      ];

      initialRequests.forEach((req) => {
        const ref = doc(db, "requests", req.id);
        batch.set(ref, req);
      });

      await batch.commit();
      console.log("Seeded requests successfully.");
    }

    const auditSnapshot = await getDocs(collection(db, "auditLogs"));
    if (auditSnapshot.empty) {
      console.log("Seeding initial audit logs...");
      const batch = writeBatch(db);

      const initialLogs = [
        {
          id: "log_1",
          timestamp: new Date().toISOString(),
          user: "admin_01",
          action: "Updated Equipment #EQ-992",
          status: "SUCCESS"
        },
        {
          id: "log_2",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: "user_mgmt_hq",
          action: "Reset Password: pilot_j_04",
          status: "SUCCESS"
        },
        {
          id: "log_3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: "sys_monitor",
          action: "Unauthorized Login Attempt",
          status: "FAILED"
        },
        {
          id: "log_4",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: "admin_02",
          action: "Deleted Archive Log: 2023_Q3",
          status: "SUCCESS"
        }
      ];

      initialLogs.forEach((log) => {
        const ref = doc(db, "auditLogs", log.id);
        batch.set(ref, log);
      });

      await batch.commit();
      console.log("Seeded audit logs successfully.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
