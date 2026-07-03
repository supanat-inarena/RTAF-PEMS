import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, doc, setDoc } from "firebase/firestore";
import { AuditLog } from "../types";
import { ShieldAlert, Server, HardDrive, Database, Activity, UserCheck, Plus, Check } from "lucide-react";

interface AdminDashboardProps {
  currentUser: { name: string; role: string; rank?: string; email: string };
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLog, setShowAddLog] = useState(false);
  const [logAction, setLogAction] = useState("");
  const [logUser, setLogUser] = useState("admin_01");

  useEffect(() => {
    // Real-time listener for audit logs
    const unsubscribe = onSnapshot(collection(db, "auditLogs"), (snapshot) => {
      const loadedLogs: AuditLog[] = [];
      snapshot.forEach((doc) => {
        loadedLogs.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      // Sort by timestamp descending
      loadedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(loadedLogs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logAction) return;

    try {
      const logId = `log_${Date.now()}`;
      const newLog: AuditLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        user: logUser,
        action: logAction,
        status: "SUCCESS"
      };

      await setDoc(doc(db, "auditLogs", logId), newLog);
      setLogAction("");
      setShowAddLog(false);
    } catch (error) {
      console.error("Error creating audit log:", error);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 md:pb-8 md:pl-20">
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-outline-variant z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold text-primary leading-tight">RTAF PEMS | Administration</span>
            <span className="text-[9px] text-secondary font-mono tracking-wider uppercase">Level 4 Security Clearance</span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="text-xs text-error font-semibold border border-error/30 hover:bg-error/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 max-w-5xl mx-auto space-y-6">
        
        {/* Banner with Restricted Access Alert */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-outline-variant rounded-xl p-6 gap-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-primary">ระบบบริหารจัดการหลังบ้าน</h2>
            <p className="text-xs text-secondary">หน่วยบริหารเทคโนโลยีสารสนเทศ กองทัพอากาศ (RTAF IT Command)</p>
          </div>
          <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-xl border border-error/20">
            <ShieldAlert className="w-6 h-6 text-error animate-pulse flex-shrink-0" />
            <div>
              <p className="font-display text-xs font-bold text-error">พื้นที่หวงห้ามเฉพาะเจ้าหน้าที่ (Admin Only)</p>
              <p className="text-[10px] text-secondary opacity-80 uppercase font-mono tracking-wider">AUTHORIZED ACCESS LOGGED</p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* System Health Section */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                ตรวจสอบสถานะระบบ (System Health)
              </h3>
              <span className="text-[10px] text-secondary">อัปเดต: 14:20:05</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant relative">
                <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-wider block">CORE SERVER</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">ONLINE</span>
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                </div>
                <span className="text-[9px] text-secondary mt-1 block">Latency: 12ms</span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-wider block">DATABASE CONNECTION</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">99.9%</span>
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                </div>
                <span className="text-[9px] text-secondary mt-1 block">Active Connections: 1,402</span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-wider block">STORAGE USAGE</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">64%</span>
                  <span className="w-2.5 h-2.5 bg-tertiary rounded-full"></span>
                </div>
                <span className="text-[9px] text-secondary mt-1 block">Available: 4.2 TB</span>
              </div>
            </div>

            {/* Network Traffic simulated graph */}
            <div className="bg-surface-container-low h-32 rounded-lg relative overflow-hidden border border-outline-variant p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-secondary uppercase tracking-widest block z-10">NETWORK TRAFFIC (24H)</span>
              <div className="flex items-end justify-between h-20 gap-1 mt-auto">
                <div className="w-full bg-primary/20 h-[50%] rounded-sm"></div>
                <div className="w-full bg-primary/30 h-[70%] rounded-sm"></div>
                <div className="w-full bg-primary/25 h-[60%] rounded-sm"></div>
                <div className="w-full bg-primary/40 h-full rounded-sm"></div>
                <div className="w-full bg-primary/35 h-[80%] rounded-sm"></div>
                <div className="w-full bg-primary/50 h-[70%] rounded-sm"></div>
                <div className="w-full bg-primary/45 h-[60%] rounded-sm"></div>
                <div className="w-full bg-primary/60 h-full rounded-sm"></div>
                <div className="w-full bg-primary/55 h-[80%] rounded-sm"></div>
                <div className="w-full bg-primary/70 h-[70%] rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* User Management Summary */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                การจัดการผู้ใช้งาน
              </h3>

              <div className="space-y-2 text-xs divide-y divide-outline-variant">
                <div className="flex justify-between py-1.5">
                  <span className="text-secondary">ผู้ใช้งานทั้งหมด</span>
                  <span className="font-bold text-primary">12,450</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-secondary text-green-600">กำลังใช้งาน (Active Sessions)</span>
                  <span className="font-bold text-green-600">482</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-secondary">แอดมินระบบ</span>
                  <span className="font-bold text-primary">14</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-secondary">ผู้ควบคุมพัสดุ</span>
                  <span className="font-bold text-primary">156</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowAddLog(true)}
              className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all mt-6 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มบันทึกผู้ใช้งานด่วน
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                บันทึกการใช้งานระบบ (Audit Logs)
              </h3>
              <span className="text-xs text-primary cursor-pointer hover:underline">ดูทั้งหมด</span>
            </div>

            {loading ? (
              <p className="text-xs text-secondary italic">กำลังโหลดบันทึกการใช้งานระบบ...</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-outline-variant">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-container text-secondary font-bold">
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">User</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant font-mono">
                    {logs.slice(0, 4).map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-2.5 font-bold text-primary">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2.5 text-secondary">{log.user}</td>
                        <td className="p-2.5 text-primary">{log.action}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-error-container text-on-error-container"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Master Data Configurations */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                ข้อมูลหลักของระบบ (Master Data)
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg cursor-pointer hover:bg-primary-fixed hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary mb-1">inventory_2</span>
                  <p className="font-bold text-primary">Equipment Types</p>
                  <span className="text-[9px] text-secondary">ประเภทพัสดุ</span>
                </div>

                <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg cursor-pointer hover:bg-primary-fixed hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary mb-1">military_tech</span>
                  <p className="font-bold text-primary">Ranks & Titles</p>
                  <span className="text-[9px] text-secondary">ชั้นยศและตำแหน่ง</span>
                </div>

                <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg cursor-pointer hover:bg-primary-fixed hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary mb-1">apartment</span>
                  <p className="font-bold text-primary">Unit Master</p>
                  <span className="text-[9px] text-secondary">สังกัด/ฝูงบิน</span>
                </div>

                <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg cursor-pointer hover:bg-primary-fixed hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary mb-1">description</span>
                  <p className="font-bold text-primary">Certifications</p>
                  <span className="text-[9px] text-secondary">มาตรฐานใบรับรอง</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-tertiary-container/10 border border-tertiary rounded-lg flex items-start gap-2 mt-4 text-[10px] text-tertiary leading-relaxed">
              <span className="material-symbols-outlined text-sm flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <span>ระวัง: การเปลี่ยนแปลงข้อมูลในส่วนนี้จะส่งผลกระทบต่อระบบสถิติและรายงานย้อนหลังทั้งหมด</span>
            </div>
          </div>

        </div>
      </main>

      {/* Quick Add Log Dialog */}
      {showAddLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddLog} className="w-full max-w-sm bg-white border border-outline-variant p-6 rounded-xl space-y-4 shadow-xl">
            <h3 className="font-display text-sm font-bold text-primary">บันทึกข้อมูลด่วน</h3>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary">ผู้ดำเนินการ</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                value={logUser}
                onChange={(e) => setLogUser(e.target.value)}
              >
                <option value="admin_01">admin_01 (System Administrator)</option>
                <option value="admin_02">admin_02 (RTAF IT Lead)</option>
                <option value="user_mgmt_hq">user_mgmt_hq (Logistics Command)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary">หัวข้อเหตุการณ์ (Action)</label>
              <input 
                type="text"
                placeholder="เช่น Create User pilot_somchai..."
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                value={logAction}
                onChange={(e) => setLogAction(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2 pt-2 text-xs">
              <button 
                type="button" 
                onClick={() => setShowAddLog(false)}
                className="flex-grow py-2 border border-outline text-secondary font-bold rounded-lg"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-grow py-2 bg-primary text-white font-bold rounded-lg shadow flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
