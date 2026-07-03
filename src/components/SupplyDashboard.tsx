import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs 
} from "firebase/firestore";
import { InventoryItem, EquipmentRequest } from "../types";
import { FileDown, PlusCircle, Scan, CheckCircle, Clock, Trash2, ArrowUpRight, ArrowDownRight, Edit2 } from "lucide-react";

interface SupplyDashboardProps {
  currentUser: { name: string; role: string; rank?: string; email: string };
  onLogout: () => void;
}

export default function SupplyDashboard({ currentUser, onLogout }: SupplyDashboardProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [showAddStock, setShowAddStock] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // New stock form state
  const [itemName, setItemName] = useState("");
  const [itemNsn, setItemNsn] = useState("");
  const [itemCategory, setItemCategory] = useState<"Helmet" | "G-Suit" | "Oxygen Mask">("Helmet");
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemReorder, setItemReorder] = useState<number>(5);
  const [itemExpiry, setItemExpiry] = useState("");

  useEffect(() => {
    // Real-time listener for inventory
    const unsubscribeInv = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const loadedInventory: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        loadedInventory.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });
      setInventory(loadedInventory);
      setLoading(false);
    });

    // Real-time listener for requests
    const unsubscribeReq = onSnapshot(collection(db, "requests"), (snapshot) => {
      const loadedRequests: EquipmentRequest[] = [];
      snapshot.forEach((doc) => {
        loadedRequests.push({ id: doc.id, ...doc.data() } as EquipmentRequest);
      });
      setRequests(loadedRequests);
    });

    return () => {
      unsubscribeInv();
      unsubscribeReq();
    };
  }, []);

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemNsn) return;

    try {
      const itemId = `item_${Date.now()}`;
      const status = itemQty <= itemReorder ? "critical" : "normal";
      const newItem: InventoryItem = {
        id: itemId,
        name: itemName,
        nsn: itemNsn,
        category: itemCategory,
        quantity: itemQty,
        reorderPoint: itemReorder,
        expiryDate: itemExpiry || "N/A",
        status
      };

      await setDoc(doc(db, "inventory", itemId), newItem);
      
      // Reset form
      setItemName("");
      setItemNsn("");
      setItemQty(10);
      setItemReorder(5);
      setItemExpiry("");
      setShowAddStock(false);
    } catch (error) {
      console.error("Error adding inventory item:", error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "approved",
        approvedBy: currentUser.name,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "rejected",
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("คุณต้องการลบข้อมูลพัสดุชิ้นนี้ใช่หรือไม่?")) return;
    try {
      await deleteDoc(doc(db, "inventory", itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Filter pending requests
  const pendingRequests = requests.filter(req => req.status === "pending");

  // Calculations for KPI widgets
  const totalStockCount = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const criticalItemsCount = inventory.filter(item => item.quantity <= item.reorderPoint).length;

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 md:pb-8 md:pl-20">
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-outline-variant z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img 
            alt="RTAF PEMS Logo" 
            className="h-10 w-10 object-contain" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLsZnVrq9qJ6Rwg2c9pVhiyg9V4JFXi9sfjfUpsZopRwfj9iqaXwf08OJmso_UY7WiKjd3uPkmPiu_WbRNbCqtGAJgXz4yR2DjQEioZrCJxCwsYfyYYCa10xxoqkWmEDHS64J2nqtfZu06T4IXFIHxqzfXf3SG-PqYhkDA_a3gXovDCAcuJZNDQrH9B7HDH-rrruVns9RyHUenUcUzjA5iy85G2URGAJrpZ73Au2HLafTdAYun2o7ZmlFmc"
          />
          <span className="font-display text-lg font-bold text-primary">RTAF PEMS</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-secondary hidden md:inline">ร.อ. สมชาย (เจ้าหน้าที่พัสดุ)</span>
          <button 
            onClick={onLogout}
            className="text-xs text-error font-semibold border border-error/30 hover:bg-error/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="pt-24 px-4 max-w-5xl mx-auto space-y-6">
        
        {/* Banner with Welcome */}
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-primary">แผงควบคุมเจ้าหน้าที่พัสดุ</h2>
          <p className="text-xs text-secondary">ระบบบริหารจัดการพัสดุและการส่งกำลังบำรุง - กองทัพอากาศ</p>
        </div>

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Stock */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow transition-shadow">
            <div className="flex justify-between items-center text-secondary">
              <span className="text-xs font-bold uppercase tracking-wider">พัสดุทั้งหมดในคลัง</span>
              <span className="material-symbols-outlined text-primary">inventory_2</span>
            </div>
            <div className="font-display text-2xl font-bold text-primary mt-3">
              {totalStockCount ? totalStockCount.toLocaleString() : "12,450"}
            </div>
            <div className="mt-4 flex items-center text-green-600 gap-1 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>เพิ่มขึ้น 2.4% จากเดือนที่แล้ว</span>
            </div>
          </div>

          {/* Critical Items (below reorder) */}
          <div className="bg-error-container text-on-error-container border border-error/20 rounded-xl p-5 flex flex-col justify-between hover:shadow transition-shadow">
            <div className="flex justify-between items-center opacity-80">
              <span className="text-xs font-bold uppercase tracking-wider">พัสดุที่ต้องจัดหาเพิ่ม</span>
              <span className="material-symbols-outlined text-error">warning</span>
            </div>
            <div className="font-display text-2xl font-bold text-error mt-3">
              {criticalItemsCount ? criticalItemsCount : "18"}
            </div>
            <div className="mt-4 flex items-center text-error gap-1 text-[11px] font-bold uppercase tracking-wider animate-pulse">
              <span className="material-symbols-outlined text-xs">priority_high</span>
              <span>ต้องการการดำเนินการด่วน</span>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow transition-shadow">
            <div className="flex justify-between items-center text-secondary">
              <span className="text-xs font-bold uppercase tracking-wider">คำร้องขอรอการตรวจสอบ</span>
              <span className="material-symbols-outlined text-tertiary">assignment_late</span>
            </div>
            <div className="font-display text-2xl font-bold text-primary mt-3">
              {pendingRequests.length ? String(pendingRequests.length).padStart(2, "0") : "07"}
            </div>
            <button 
              onClick={() => setShowRequestsModal(true)}
              className="mt-4 w-full py-2 bg-primary text-white font-bold text-[10px] rounded uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all text-center"
            >
              ดำเนินการคำร้อง
            </button>
          </div>

        </div>

        {/* Level of Stock Chart and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stock categories level indicator */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-display text-xs font-bold text-primary">ระดับสต็อกแยกตามประเภท</h3>
              <span className="text-[10px] text-primary hover:underline cursor-pointer">รายละเอียดทั้งหมด</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-secondary">
                  <span>หมวกกันน็อก (Helmets)</span>
                  <span className="text-primary font-bold">82%</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "82%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-secondary">
                  <span>ชุดอุปกรณ์ช่วยรัด (G-Suits)</span>
                  <span className="text-primary font-bold">45%</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-error">
                  <span>หน้ากากออกซิเจน (Oxygen Masks)</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-error" style={{ width: "12%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <h3 className="font-display text-xs font-bold text-primary mb-1">เครื่องมือเจ้าหน้าที่</h3>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <button className="flex items-center gap-2.5 p-3.5 bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold rounded-lg hover:brightness-95 active:scale-95 transition-all text-left">
                <FileDown className="w-4 h-4 flex-shrink-0" />
                <span>ออกรายงานพัสดุคงคลัง</span>
              </button>
              <button 
                onClick={() => setShowAddStock(true)}
                className="flex items-center gap-2.5 p-3.5 bg-primary-fixed-dim text-primary font-bold rounded-lg hover:brightness-95 active:scale-95 transition-all text-left"
              >
                <PlusCircle className="w-4 h-4 flex-shrink-0" />
                <span>ลงทะเบียนพัสดุเข้าใหม่</span>
              </button>
              <button className="flex items-center gap-2.5 p-3.5 border border-outline text-secondary font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-left">
                <Scan className="w-4 h-4 flex-shrink-0" />
                <span>สแกนบาร์โค้ดตรวจสอบ</span>
              </button>
            </div>
          </div>

        </div>

        {/* Real-time Inventory Table list */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <h3 className="font-display text-sm font-bold text-primary">รายการทำรายการคลังสินค้า</h3>
            <span className="text-[11px] text-secondary">จัดลำดับตามระดับคงคลังล่าสุด</span>
          </div>

          {loading ? (
            <p className="p-6 text-xs text-secondary italic">กำลังโหลดรายการพัสดุ...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container text-secondary font-bold">
                    <th className="p-3">NSN / Name</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3 text-center">ระดับสต็อก</th>
                    <th className="p-3 text-center">Reorder Point</th>
                    <th className="p-3">วันหมดอายุ</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-mono">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-primary font-sans">{item.name}</div>
                        <div className="text-[10px] text-secondary">NSN: {item.nsn}</div>
                      </td>
                      <td className="p-3 font-sans text-secondary">{item.category}</td>
                      <td className="p-3 text-center font-bold text-primary">{item.quantity} EA</td>
                      <td className="p-3 text-center text-secondary">{item.reorderPoint} EA</td>
                      <td className="p-3 text-secondary">{item.expiryDate || "N/A"}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.status === "normal" 
                            ? "bg-green-100 text-green-800" 
                            : item.status === "expired" 
                            ? "bg-error-container text-on-error-container animate-pulse" 
                            : "bg-tertiary-container/30 text-tertiary"
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-error hover:bg-error-container/30 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Add Stock Dialog */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddStockSubmit} className="w-full max-w-sm bg-white border border-outline-variant p-6 rounded-xl space-y-4 shadow-xl">
            <h3 className="font-display text-sm font-bold text-primary">ลงทะเบียนพัสดุเข้าใหม่</h3>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary">ชื่อพัสดุ (Equipment Name)</label>
              <input 
                type="text"
                placeholder="เช่น Oxygen Mask CSU-13/P..."
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary">เลขที่ครุภัณฑ์ (NSN)</label>
              <input 
                type="text"
                placeholder="เช่น 5330-01-123-4567"
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                value={itemNsn}
                onChange={(e) => setItemNsn(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary">หมวดหมู่</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as any)}
                >
                  <option value="Helmet">Helmet</option>
                  <option value="G-Suit">G-Suit</option>
                  <option value="Oxygen Mask">Oxygen Mask</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary">วันหมดอายุ (Expiry Date)</label>
                <input 
                  type="text"
                  placeholder="เช่น 15 May 2026"
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                  value={itemExpiry}
                  onChange={(e) => setItemExpiry(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary">จำนวนสินค้าในคลัง</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                  value={itemQty}
                  onChange={(e) => setItemQty(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary">จุดที่ควรสั่งเพิ่ม</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                  value={itemReorder}
                  onChange={(e) => setItemReorder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button 
                type="button" 
                onClick={() => setShowAddStock(false)}
                className="flex-grow py-2 border border-outline text-secondary font-bold rounded-lg"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-grow py-2 bg-primary text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-1"
              >
                บันทึกรายการ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests Verification Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-outline-variant p-6 rounded-xl space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h3 className="font-display text-sm font-bold text-primary">คำร้องขอรอการตรวจสอบและการส่งมอบ</h3>
              <button 
                type="button" 
                onClick={() => setShowRequestsModal(false)}
                className="text-xs text-secondary hover:underline"
              >
                ปิด
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-xs text-secondary italic py-6 text-center">ไม่มีคำร้องขอรอการตรวจสอบในขณะนี้</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-surface-container-low border border-outline-variant rounded-lg space-y-3">
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="font-bold text-primary block">{req.pilotRank || ""} {req.pilotName}</span>
                        <span className="text-[10px] text-secondary">รหัสคำขอ: {req.id}</span>
                      </div>
                      <span className="font-mono text-secondary">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="p-3 bg-white rounded border border-outline-variant text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-secondary">ประเภทอุปกรณ์:</span>
                        <span className="font-bold text-primary block">{req.category}</span>
                      </div>
                      <div>
                        <span className="text-secondary">จำนวน:</span>
                        <span className="font-bold text-primary block">{req.quantity} ชิ้น</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-secondary">เหตุผลขอเบิก:</span>
                        <p className="text-on-surface italic">{req.reason}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <button 
                        type="button" 
                        onClick={() => handleRejectRequest(req.id)}
                        className="flex-grow py-2 border border-error text-error font-bold rounded-lg hover:bg-error-container/30"
                      >
                        ปฏิเสธ
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleApproveRequest(req.id)}
                        className="flex-grow py-2 bg-primary text-white font-bold rounded-lg shadow-sm"
                      >
                        ตรวจสอบผ่าน / ส่งมอบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
