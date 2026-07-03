import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { EquipmentRequest } from "../types";
import { Plus, Upload, AlertTriangle, Truck, Hourglass, Shield, FileText } from "lucide-react";

interface PilotDashboardProps {
  currentUser: { name: string; role: string; rank?: string; email: string };
  onNewRequestClick: () => void;
  onLogout: () => void;
}

export default function PilotDashboard({ currentUser, onNewRequestClick, onLogout }: PilotDashboardProps) {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time query to get only requests belonging to current logged in pilot
    const q = query(
      collection(db, "requests"),
      where("pilotName", "==", currentUser.name)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRequests: EquipmentRequest[] = [];
      snapshot.forEach((doc) => {
        loadedRequests.push({ id: doc.id, ...doc.data() } as EquipmentRequest);
      });
      setRequests(loadedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

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
          <span className="text-xs text-secondary hidden md:inline">{currentUser.name} ({currentUser.role === 'pilot' ? 'นักบิน' : currentUser.role})</span>
          <button 
            onClick={onLogout}
            className="text-xs text-error font-semibold border border-error/30 hover:bg-error/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="pt-24 px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-xl bg-primary px-6 py-8 text-white shadow">
          <div className="relative z-10 space-y-2">
            <p className="font-mono text-[10px] text-on-primary-container tracking-widest uppercase">กองทัพอากาศไทย</p>
            <h2 className="font-display text-2xl font-bold">ยินดีต้อนรับ, {currentUser.rank || ""} {currentUser.name}</h2>
            <p className="font-sans text-xs text-on-primary-container max-w-xl leading-relaxed">
              ระบบบริหารจัดการอุปกรณ์ส่วนตัวของนักบิน เข้าถึงข้อมูลเครื่องแต่งกายและอุปกรณ์นิรภัยของคุณได้ทันทีเพื่อความปลอดภัยในทุกลำเลียงปฏิบัติการ
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-container rounded-full blur-3xl opacity-30"></div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action Card */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow transition-shadow">
            <div className="space-y-1">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
                ดำเนินการด่วน
              </h3>
              <p className="text-xs text-secondary">เริ่มทำรายการเบิกอุปกรณ์การบินใหม่ หรือยื่นเรื่องขอรับการส่งบำรุงรักษาทันที</p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={onNewRequestClick}
                className="flex-grow py-3 bg-primary text-white font-bold text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                NEW REQUEST
              </button>
              <button className="flex-grow py-3 border border-outline text-secondary font-bold text-xs rounded-lg hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                EXPORT REPORT
              </button>
            </div>
          </div>

          {/* KPI Mini Card */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-5xl font-display font-bold text-primary">05</span>
            <span className="font-mono text-[10px] text-secondary uppercase tracking-widest mt-1">MY EQUIPMENT</span>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-4">
              <div className="bg-primary h-full w-[80%]"></div>
            </div>
          </div>

          {/* Active Requests */}
          <div className="md:col-span-1 bg-white border border-outline-variant rounded-xl p-5">
            <h3 className="font-display text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
              Active Requests
            </h3>

            {loading ? (
              <p className="text-xs text-secondary italic">กำลังโหลดรายการคำขอ...</p>
            ) : requests.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-outline-variant rounded-lg">
                <p className="text-xs text-secondary">ไม่มีคำขอค้างคาในขณะนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-3">
                      {req.status === "pending" ? (
                        <Hourglass className="w-8 h-8 text-tertiary bg-tertiary-container/20 p-1.5 rounded-lg flex-shrink-0" />
                      ) : (
                        <Truck className="w-8 h-8 text-primary bg-primary-fixed-dim p-1.5 rounded-lg flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-primary">{req.category}</p>
                        <p className="text-[10px] text-secondary">ID: {req.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      req.status === "pending" ? "bg-tertiary-container/30 text-tertiary" : "bg-primary-fixed-dim text-primary"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Alerts */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-sm font-bold text-error flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
                Maintenance Alerts
              </h3>
              <span className="text-[11px] text-primary hover:underline cursor-pointer">ดูทั้งหมด</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant text-secondary">
                    <th className="pb-2 font-semibold uppercase">Equipment</th>
                    <th className="pb-2 font-semibold uppercase">Serial No.</th>
                    <th className="pb-2 font-semibold uppercase">Expiry Date</th>
                    <th className="pb-2 font-semibold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-low">
                    <td className="py-3 font-semibold text-primary">HGU-55/P Helmet</td>
                    <td className="py-3 text-secondary font-mono">SN-RTAF-9902</td>
                    <td className="py-3 text-secondary">15 May 2024</td>
                    <td className="py-3">
                      <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold uppercase">EXPIRED</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low">
                    <td className="py-3 font-semibold text-primary">MBU-20/P Oxygen Mask</td>
                    <td className="py-3 text-secondary font-mono">SN-RTAF-8812</td>
                    <td className="py-3 text-secondary">12 Dec 2026</td>
                    <td className="py-3">
                      <span className="bg-primary-container text-on-primary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase">NORMAL</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Depot Status Photo Card */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden group relative min-h-[180px] flex items-end">
            <img 
              alt="Supply Depot Status" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhCpAOqFS6AFKR53kAxOTLke_-_jvueiADDViD7o8NYs8WV5MTAXNfA9T3VbMhR7gAqV4g4Nn4Rw_pQ6RNJrrlF61_0rIZ0gH7yGs36g_ED0kluHUZVCJPSk1prIUAoyfFunnn3xINzX8lLZcNFBJnh9OA_YComRsHKQVrEN7E-NA8EMNN66jA8AZsiP_sGxN7SPrSAwaJmNJtZPNDeftcAP8bPyZiQKK1-G04bHa35Oy2Gw7va6bCnJ6fSRZJ_LI8M4wcIg0Ei28"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative z-10 w-full p-4">
              <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-lg border border-white/20">
                <p className="text-xs font-bold text-primary">Supply Depot Status</p>
                <p className="text-[10px] text-secondary">Wing 1, Nakhon Ratchasima</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
