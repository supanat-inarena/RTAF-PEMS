import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { EquipmentRequest } from "../types";
import { Check, ShieldAlert, Award, TrendingUp, DollarSign, Activity } from "lucide-react";

interface ExecutiveDashboardProps {
  currentUser: { name: string; role: string; rank?: string; email: string };
  onLogout: () => void;
}

export default function ExecutiveDashboard({ currentUser, onLogout }: ExecutiveDashboardProps) {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    // Real-time listener for requests
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const loadedRequests: EquipmentRequest[] = [];
      snapshot.forEach((doc) => {
        loadedRequests.push({ id: doc.id, ...doc.data() } as EquipmentRequest);
      });
      // Sort to show pending requests first
      loadedRequests.sort((a, b) => (a.status === "pending" ? -1 : 1));
      setRequests(loadedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (reqId: string) => {
    try {
      await updateDoc(doc(db, "requests", reqId), {
        status: "approved",
        approvedBy: currentUser.name,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const pendingRequests = requests.filter(req => req.status === "pending" || req.status === "verified");

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 md:pb-8 md:pl-20">
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-outline-variant z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold text-primary leading-tight">RTAF PEMS | Executive Console</span>
            <span className="text-[9px] text-secondary font-mono tracking-wider uppercase">Strategic Logistics Operations</span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="text-xs text-error font-semibold border border-error/30 hover:bg-error/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Main Area */}
      <main className="pt-24 px-4 max-w-5xl mx-auto space-y-6">
        
        {/* Title */}
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-primary">แผงควบคุมผู้บริหาร</h2>
          <p className="text-xs text-secondary">ระบบสรุปสถิติ วิเคราะห์แนวโน้ม และการกระจายตัวพัสดุกองทัพอากาศ</p>
        </div>

        {/* KPI Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block">นักบินที่ให้บริการรวม</span>
              <h2 className="text-2xl font-display font-bold text-primary mt-1">1,248 ราย</h2>
            </div>
            <div className="flex items-center text-green-600 text-[10px] font-bold mt-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4.2% จากเดือนที่แล้ว
            </div>
          </div>

          <div className="bg-white border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block">คำขอรอการอนุมัติ</span>
              <h2 className="text-2xl font-display font-bold text-error mt-1">{pendingRequests.length} รายการ</h2>
            </div>
            <button 
              onClick={() => setShowApprovalModal(true)}
              className="mt-2 w-full py-1.5 bg-primary text-white text-[10px] font-bold rounded uppercase hover:opacity-90 active:scale-95 transition-all"
            >
              ดำเนินการทันที
            </button>
          </div>

          <div className="bg-white border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block">มูลค่าคงคลังรวม</span>
              <h2 className="text-2xl font-display font-bold text-primary mt-1">฿42.5M</h2>
            </div>
            <div className="flex items-center text-secondary text-[10px] mt-2">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> อัปเดตเมื่อสักครู่
            </div>
          </div>

          <div className="bg-white border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block">สถานะความพร้อมอุปกรณ์</span>
              <h2 className="text-2xl font-display font-bold text-tertiary mt-1">98.2%</h2>
            </div>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-tertiary h-full w-[98%]"></div>
            </div>
          </div>
        </section>

        {/* Visual Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Equipment distribution bar chart */}
          <div className="md:col-span-7 bg-white border border-outline-variant rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-display text-xs font-bold text-primary">การกระจายอุปกรณ์ตามกองบิน</h3>
              <p className="text-[10px] text-secondary">จำนวนชุดอุปกรณ์ (Egress/Survival) ที่ประจำการในแต่ละหน่วย</p>
            </div>

            <div className="h-44 flex items-end justify-between gap-1 pt-2">
              {[
                { label: "Wing 1", h: "75%", qty: 450 },
                { label: "Wing 2", h: "60%", qty: 320 },
                { label: "Wing 4", h: "95%", qty: 510 },
                { label: "Wing 6", h: "40%", qty: 180 },
                { label: "Wing 7", h: "80%", qty: 390 },
                { label: "Wing 21", h: "55%", qty: 270 }
              ].map((bar) => (
                <div key={bar.label} className="w-full flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-primary/20 hover:bg-primary rounded-t transition-colors relative group flex justify-center" style={{ height: bar.h }}>
                    <span className="absolute -top-7 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {bar.qty} Units
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-secondary font-mono">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Trend Card */}
          <div className="md:col-span-5 bg-primary text-white rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="font-display text-xs font-bold">แนวโน้มค่าใช้จ่าย</h3>
              <p className="text-[10px] text-on-primary-container">งบประมาณการจัดซื้อและซ่อมบำรุงประจำไตรมาส</p>
            </div>

            <div className="py-4 text-center">
              <span className="text-[9px] font-bold text-on-primary-container uppercase tracking-wider block">BUDGET STATUS</span>
              <h2 className="text-xl font-display font-bold">ภายในกรอบงบประมาณ</h2>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
              <div>
                <span className="text-[10px] text-on-primary-container block">เบิกจ่ายแล้ว</span>
                <span className="font-bold text-sm">฿12.8M</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-on-primary-container block">งบประมาณคงเหลือ</span>
                <span className="font-bold text-sm text-tertiary-fixed-dim">฿4.2M</span>
              </div>
            </div>
          </div>

        </div>

        {/* Requests summary */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-primary">รายการคำขอมูลค่าสูงล่าสุด</h3>
            <span className="text-[11px] text-secondary">กรองข้อมูลเฉพาะยอดเบิกจ่ายสะสม</span>
          </div>

          {loading ? (
            <p className="p-6 text-xs text-secondary italic">กำลังโหลดรายการคำขอ...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container text-secondary font-bold">
                    <th className="p-3">รหัสคำขอ</th>
                    <th className="p-3">รายการอุปกรณ์</th>
                    <th className="p-3 text-center">จำนวน</th>
                    <th className="p-3">หน่วยงาน</th>
                    <th className="p-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-mono">
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 font-bold text-primary">{req.id}</td>
                      <td className="p-3 font-sans text-primary font-semibold">{req.category} (สำหรับ {req.reason.substring(0, 30)}...)</td>
                      <td className="p-3 text-center text-primary font-bold">{req.quantity}</td>
                      <td className="p-3 font-sans text-secondary">{req.pilotRank || "น.ท."} {req.pilotName}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          req.status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : req.status === "rejected" 
                            ? "bg-error-container text-on-error-container" 
                            : "bg-tertiary-container/30 text-tertiary"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Approval dialog */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-outline-variant p-6 rounded-xl space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h3 className="font-display text-sm font-bold text-primary">คำขออนุมัติเบิกพัสดุมูลค่าสูง</h3>
              <button 
                type="button" 
                onClick={() => setShowApprovalModal(false)}
                className="text-xs text-secondary hover:underline"
              >
                ปิด
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-xs text-secondary italic py-6 text-center">ไม่มีคำร้องรอการอนุมัติในขณะนี้</p>
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
                        onClick={() => handleApprove(req.id)}
                        className="flex-grow py-2 bg-primary text-white font-bold rounded-lg shadow-sm"
                      >
                        อนุมัติคำขอ (Approve)
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
