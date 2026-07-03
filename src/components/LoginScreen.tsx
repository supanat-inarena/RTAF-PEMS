import React, { useState } from "react";
import { 
  LogIn, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Smartphone, 
  Info,
  Sparkles,
  Database
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: { name: string; role: string; rank?: string; email: string }) => void;
}

type RoleType = "pilot" | "supply" | "commander" | "executive" | "admin";

interface RtafUserProfile {
  username: string;
  fname: string;
  lname: string;
  rank: string;
  position: string;
  org: string;
  email: string;
  role: RoleType;
}

// Simulated authentic RTAF user profiles as specified in RTAF AUTHENTICATION.md
const RTAF_PROFILES: Record<RoleType, RtafUserProfile> = {
  pilot: {
    username: "somchai_pi",
    fname: "สมชาย",
    lname: "รักดี",
    rank: "น.ท.",
    position: "นักบินขับไล่ประจำกองบิน 6",
    org: "กองบิน 6",
    email: "somchai_pi@rtaf.mi.th",
    role: "pilot"
  },
  supply: {
    username: "mana_su",
    fname: "มานะ",
    lname: "มีสุข",
    rank: "พ.ต.",
    position: "นายทหารพัสดุ กองบิน 6",
    org: "กองบิน 6",
    email: "mana_su@rtaf.mi.th",
    role: "supply"
  },
  commander: {
    username: "prasit_co",
    fname: "ประสิทธิ์",
    lname: "ยอดบิน",
    rank: "พล.อ.ท.",
    position: "ผู้บังคับการกองบิน 6",
    org: "กองบิน 6",
    email: "prasit_co@rtaf.mi.th",
    role: "commander"
  },
  executive: {
    username: "manop_ex",
    fname: "มานพ",
    lname: "มั่นคง",
    rank: "พล.อ.อ.",
    position: "ผู้บัญชาการทหารอากาศ",
    org: "บก.ทอ.",
    email: "manop_ex@rtaf.mi.th",
    role: "executive"
  },
  admin: {
    username: "ukit_wu",
    fname: "อุกฤษฏ์",
    lname: "อู่วิเชียร",
    rank: "น.อ.",
    position: "ผู้อำนวยการกองคอมพิวเตอร์ (ศซอ.ทอ.)",
    org: "ศซอ.ทอ.",
    email: "ukit_wu@rtaf.mi.th",
    role: "admin"
  }
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<RoleType>("pilot");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authSteps, setAuthSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // Helper to clean up the username input
  const getCleanUsername = (raw: string) => {
    return raw.trim().toLowerCase().split("@")[0];
  };

  // Get profile matching input or generate one dynamically if custom username is typed
  const resolveRtafProfile = (rawUsername: string, role: RoleType): RtafUserProfile => {
    const clean = getCleanUsername(rawUsername);
    const predefined = Object.values(RTAF_PROFILES).find(p => p.username === clean);
    if (predefined) {
      return predefined;
    }

    // Dynamic generation keeping data structures realistic
    const formattedName = clean.charAt(0).toUpperCase() + clean.slice(1);
    let rank = "น.ท.";
    let position = "นายทหารปฏิบัติการ";
    let org = "กองบิน 6";

    if (role === "supply") {
      rank = "ร.อ.";
      position = "นายทหารส่งกำลังบำรุง";
      org = "พศ.ทอ.";
    } else if (role === "commander") {
      rank = "พล.อ.ท.";
      position = "รองผู้บัญชาการกองพลบิน";
      org = "บก.ทอ.";
    } else if (role === "executive") {
      rank = "พล.อ.อ.";
      position = "เสนาธิการทหารอากาศ";
      org = "บก.ทอ.";
    } else if (role === "admin") {
      rank = "น.อ.";
      position = "นายทหารพัฒนาระบบเทคโนโลยีสารสนเทศ";
      org = "ศซอ.ทอ.";
    }

    return {
      username: clean,
      fname: formattedName,
      lname: "รักษาความมั่นคง",
      rank,
      position,
      org,
      email: `${clean}@rtaf.mi.th`,
      role
    };
  };

  const handleRtafLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanUser = getCleanUsername(username);

    if (!cleanUser) {
      setError("กรุณากรอกชื่อผู้ใช้งาน ทอ. (Email Prefix)");
      return;
    }

    if (!otp) {
      setError("กรุณากรอกรหัส OTP 6 หลัก");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("รหัส OTP ต้องเป็นตัวเลข 6 หลักเท่านั้น");
      return;
    }

    setLoading(true);
    setAuthSteps([]);
    setCurrentStepIndex(-1);

    const profile = resolveRtafProfile(username, selectedRole);

    // Mock API response structure based on RTAF AUTHENTICATION.md
    const rtafMockApiResponse = {
      token: "session_rtaf_token_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      login_mode: "SWC-AUTH-Login",
      user: profile.username,
      user_name: `${profile.rank} ${profile.fname} ${profile.lname}`,
      fname: profile.fname,
      lname: profile.lname,
      rankID: profile.rank === "พล.อ.อ." ? "201" : profile.rank === "พล.อ.ท." ? "202" : "101",
      user_position: profile.position,
      user_orgname: profile.org,
      user_orgname_code: "RTAF-" + profile.org.replace(/\s+/g, "")
    };

    const steps = [
      `📡 กำลังส่งข้อมูลไปยังศูนย์กลางเครือข่ายกองทัพอากาศ (https://otp.rtaf.mi.th/api/v2/mfa/login)...`,
      `🔑 ขอสิทธิ์ตรวจสอบผ่านช่องทาง SWC-AUTH-Login (บัญชี: ${profile.username}@rtaf.mi.th)...`,
      `🔒 ตรวจสอบรหัส OTP (MFA Token: ${otp}) กับบริการ OTP ทอ. กลาง...`,
      `💾 ได้รับข้อมูลตอบกลับสำเร็จจาก RTAF Authentication:\n` + JSON.stringify(rtafMockApiResponse, null, 2),
      `👥 บันทึกและดึงข้อมูลบุคลากร ทอ. จากระบบเรียบร้อย (สังกัด: ${profile.org})`,
      `🚀 ยืนยันตัวตนสำเร็จ! กำลังนำคุณเข้าสู่ระบบ RTAF PEMS (สิทธิ์: ${profile.role.toUpperCase()})`
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      setAuthSteps(prev => [...prev, steps[i]]);
      // Delays for ultra-realistic terminal feedback feel
      await new Promise(resolve => setTimeout(resolve, i === 3 ? 1200 : i === 0 ? 600 : 400));
    }

    setLoading(false);
    onLoginSuccess({
      name: `${profile.rank} ${profile.fname} ${profile.lname}`,
      role: profile.role,
      rank: profile.rank,
      email: profile.email
    });
  };

  const handleQuickLoginSelect = async (role: RoleType) => {
    const profile = RTAF_PROFILES[role];
    setSelectedRole(role);
    setUsername(profile.username);
    setOtp("123456");
    setError("");

    setLoading(true);
    setAuthSteps([]);
    setCurrentStepIndex(-1);

    const rtafMockApiResponse = {
      token: "session_rtaf_token_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      login_mode: "SWC-AUTH-Login",
      user: profile.username,
      user_name: `${profile.rank} ${profile.fname} ${profile.lname}`,
      fname: profile.fname,
      lname: profile.lname,
      rankID: profile.rank === "พล.อ.อ." ? "201" : profile.rank === "พล.อ.ท." ? "202" : "101",
      user_position: profile.position,
      user_orgname: profile.org,
      user_orgname_code: "RTAF-" + profile.org.replace(/\s+/g, "")
    };

    const steps = [
      `📡 [BYPASS] เชื่อมต่อสิทธิ์ความปลอดภัยและโหลดข้อมูลข้าราชการจาก RTAF AUTHENTICATION.md...`,
      `🔑 ยืนยันสิทธิ์สำหรับบัญชี: ${profile.username}@rtaf.mi.th (บทบาท: ${role.toUpperCase()})...`,
      `💾 ผลลัพธ์ AD Response:\n` + JSON.stringify(rtafMockApiResponse, null, 2),
      `🚀 ยืนยันตัวตนสำเร็จ! นำคุณเข้าสู่ระบบ RTAF PEMS ในฐานะ ${profile.rank} ${profile.fname} ${profile.lname}`
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      setAuthSteps(prev => [...prev, steps[i]]);
      await new Promise(resolve => setTimeout(resolve, i === 2 ? 600 : 300));
    }

    setLoading(false);
    onLoginSuccess({
      name: `${profile.rank} ${profile.fname} ${profile.lname}`,
      role: profile.role,
      rank: profile.rank,
      email: profile.email
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 login-gradient">
      <main className="w-full max-w-[950px] bg-white border border-outline-variant shadow-lg rounded-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Brand Visual (Desktop only) */}
        <div className="hidden md:flex md:w-1/3 bg-primary p-6 flex-col items-center justify-center text-center text-white relative">
          <div className="absolute inset-0 bg-radial-gradient from-[#1b365d] to-[#002046] opacity-95 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <img 
              alt="RTAF PEMS Logo" 
              className="w-24 h-24 mb-4 brightness-110 object-contain drop-shadow" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLsZnVrq9qJ6Rwg2c9pVhiyg9V4JFXi9sfjfUpsZopRwfj9iqaXwf08OJmso_UY7WiKjd3uPkmPiu_WbRNbCqtGAJgXz4yR2DjQEioZrCJxCwsYfyYYCa10xxoqkWmEDHS64J2nqtfZu06T4IXFIHxqzfXf3SG-PqYhkDA_a3gXovDCAcuJZNDQrH9B7HDH-rrruVns9RyHUenUcUzjA5iy85G2URGAJrpZ73Au2HLafTdAYun2o7ZmlFmc"
            />
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold rounded-full mb-3 border border-yellow-500/30">
              <ShieldCheck className="w-3 h-3" /> RTAF SECURE
            </div>
            <h1 className="font-display text-2xl font-bold mb-1 tracking-tight">RTAF PEMS</h1>
            <p className="font-sans text-xs opacity-80">Pilot Equipment Management System</p>
            
            <div className="mt-8 pt-4 border-t border-white/20 w-full text-center">
              <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-white/80">
                ระบบจัดการอุปกรณ์นักบิน ทอ.
              </span>
            </div>
            
            <div className="mt-12 border-t border-white/10 pt-4 text-[10px] text-white/50 w-full">
              ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร ทอ. <br /> © 2026 สงวนลิขสิทธิ์
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Side */}
        <div className="flex-1 p-6 md:p-8">
          {/* Mobile Logo Header */}
          <div className="flex md:hidden items-center gap-3 mb-6">
            <img 
              alt="RTAF PEMS Logo" 
              className="w-12 h-12 object-contain" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLsZnVrq9qJ6Rwg2c9pVhiyg9V4JFXi9sfjfUpsZopRwfj9iqaXwf08OJmso_UY7WiKjd3uPkmPiu_WbRNbCqtGAJgXz4yR2DjQEioZrCJxCwsYfyYYCa10xxoqkWmEDHS64J2nqtfZu06T4IXFIHxqzfXf3SG-PqYhkDA_a3gXovDCAcuJZNDQrH9B7HDH-rrruVns9RyHUenUcUzjA5iy85G2URGAJrpZ73Au2HLafTdAYun2o7ZmlFmc"
            />
            <div>
              <h1 className="font-display text-lg font-bold text-primary">RTAF PEMS</h1>
              <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">RTAF SECURE</span>
            </div>
          </div>

          <header className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold text-primary">ระบบการยืนยันตัวตนกองทัพอากาศ</h2>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">SWC-AUTH</span>
            </div>
            <p className="font-sans text-xs text-secondary">กรุณายืนยันตัวตนผ่านระบบบริการยืนยันตัวตนกลาง (RTAF OTP Authentication) เพื่อลงชื่อเข้าใช้งาน PEMS</p>
          </header>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg flex items-center gap-2 text-xs border border-red-200">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Simulated RTAF Server Terminal Response */}
          {loading && (
            <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-green-400 border-t-transparent animate-spin"></div>
                <span className="text-xs font-bold text-green-400">RTAF SECURITY HANDSHAKE IN PROGRESS...</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-emerald-400 bg-black p-3.5 rounded border border-slate-800 overflow-y-auto shadow-inner max-h-[220px]">
                {authSteps.map((step, idx) => (
                  <pre key={idx} className={`whitespace-pre-wrap ${idx === currentStepIndex ? "animate-pulse font-bold text-white" : "text-emerald-400"}`}>
                    {step}
                  </pre>
                ))}
              </div>
            </div>
          )}

          {/* Role Grid Option for Simulation Context */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                เลือกบทบาทที่ต้องการเปิดสิทธิ์การเข้าถึงข้อมูลระบบ
              </label>
              <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Database className="w-3 h-3" /> ข้อมูลจาก RTAF Authentication
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(["pilot", "supply", "commander", "executive", "admin"] as RoleType[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-2 py-2 rounded-lg border text-center transition-all ${
                    selectedRole === role 
                      ? "bg-primary text-white border-primary shadow-sm font-semibold text-xs" 
                      : "bg-white text-slate-700 border-outline-variant hover:bg-slate-50 text-[11px]"
                  }`}
                >
                  {role === "pilot" && "👨‍✈️ นักบิน"}
                  {role === "supply" && "📦 พัสดุ"}
                  {role === "commander" && "🎖️ ผบ."}
                  {role === "executive" && "📊 ผู้บริหาร"}
                  {role === "admin" && "⚙️ แอดมิน"}
                </button>
              ))}
            </div>
          </section>

          {/* Login Inputs Form */}
          <form className="space-y-4" onSubmit={handleRtafLogin}>
            <div>
              <label className="text-[11px] font-semibold text-secondary flex items-center gap-1 mb-1" htmlFor="username">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ชื่อผู้ใช้งานกองทัพอากาศ (RTAF Email Prefix)
              </label>
              <div className="relative">
                <input 
                  id="username"
                  className="w-full pl-3 pr-24 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs font-mono lowercase"
                  placeholder="ตัวอย่าง: ukit_wu"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 select-none bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  @rtaf.mi.th
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-300" />
                ระบุเฉพาะอักษรภาษาอังกฤษ ตัวเลข หรืออัญประกาศเดี่ยว (เช่น ukit_wu) ห้ามใส่ @rtaf.mi.th ซ้ำซ้อน
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-secondary flex items-center gap-1 mb-1" htmlFor="otp">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                รหัส OTP 6 หลัก (จากระบบยืนยันตัวตน MFA ทอ.)
              </label>
              <input 
                id="otp"
                maxLength={6}
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs font-mono tracking-widest text-center text-lg font-bold"
                placeholder="------"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
              />
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-300" />
                ป้อนรหัสผ่านครั้งเดียวที่แสดงบนแอปยืนยันตัวตน ทอ. หรือได้รับผ่านไลน์ OA
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-lg shadow hover:opacity-95 active:scale-[0.99] transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-slate-400"
                type="submit"
                disabled={loading}
              >
                <LogIn className="w-4 h-4" />
                {loading 
                  ? "กำลังประมวลผลข้อมูลความปลอดภัย..." 
                  : "ยืนยันตัวตนและเข้าสู่ระบบด้วย RTAF OTP"
                }
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-outline-variant"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[9px] uppercase font-bold tracking-wider text-center">
                  ข้อมูลกำลังพลจำลองจาก RTAF AUTHENTICATION.md
                </span>
                <div className="flex-grow border-t border-outline-variant"></div>
              </div>

              {/* Genuine quick login presets matching RTAF AUTHENTICATION.md */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                {(["pilot", "supply", "commander", "executive", "admin"] as RoleType[]).map((role) => {
                  const p = RTAF_PROFILES[role];
                  return (
                    <button 
                      key={role}
                      type="button"
                      onClick={() => handleQuickLoginSelect(role)}
                      className="py-2 px-1 border border-dashed border-primary/40 bg-slate-50 hover:bg-primary-fixed hover:border-primary text-[10px] rounded text-primary font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 shadow-sm"
                    >
                      <span className="truncate max-w-full text-[10px]">
                        {role === "pilot" && `👨‍✈️ ${p.username}`}
                        {role === "supply" && `📦 ${p.username}`}
                        {role === "commander" && `🎖️ ${p.username}`}
                        {role === "executive" && `📊 ${p.username}`}
                        {role === "admin" && `⚙️ ${p.username}`}
                      </span>
                      <span className="text-[8px] opacity-75 font-normal text-slate-500">
                        {p.rank} {p.fname}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] text-secondary">
                มีปัญหาในการเข้าใช้งานระบบหรือต้องการความช่วยเหลือเรื่องข้อมูล AD/MFA? <br />
                <span className="text-primary font-semibold hover:underline cursor-pointer">ติดต่อ กองคอมพิวเตอร์ ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร ทอ. (ศซอ.ทอ.) โทร. 0-2534-XXXX</span>
              </p>
            </div>
          </form>

          <footer className="mt-8 pt-4 border-t border-outline-variant text-center">
            <p className="text-[9px] text-slate-400">
              ระบบนี้ได้รับการคุ้มครองด้วยเทคโนโลยีความปลอดภัยสารสนเทศกองทัพอากาศไทย การสวมรอยหรือพยายามเข้าถึงฐานข้อมูล มีโทษจำคุกและปรับตามพระราชบัญญัติคอมพิวเตอร์และวินัยทหารสูงสุด
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
