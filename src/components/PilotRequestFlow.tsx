import { useState } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { EquipmentRequest } from "../types";
import { Check, ArrowLeft, ArrowRight, ShieldCheck, FileText, CloudUpload, Trash2 } from "lucide-react";

interface PilotRequestFlowProps {
  currentUser: { name: string; role: string; rank?: string; email: string };
  onClose: () => void;
}

type StepType = "Equipment" | "Details" | "Attachments" | "Submit";
const STEPS: StepType[] = ["Equipment", "Details", "Attachments", "Submit"];

export default function PilotRequestFlow({ currentUser, onClose }: PilotRequestFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [category, setCategory] = useState<"Helmet" | "G-Suit" | "Oxygen Mask">("Helmet");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [submitting, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const year = new Date().getFullYear();
      const randNum = Math.floor(100 + Math.random() * 900); // 3-digit code
      const reqId = `REQ-${year}-${randNum}`;

      const newRequest: EquipmentRequest = {
        id: reqId,
        pilotId: currentUser.email,
        pilotName: currentUser.name,
        pilotRank: currentUser.rank || "น.ท.",
        category,
        quantity,
        reason: reason || "คำขอสับเปลี่ยนอุปกรณ์สำหรับการซ้อมบิน",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "requests", reqId), newRequest);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error creating request:", err);
      setError("ไม่สามารถส่งคำขอได้ในขณะนี้: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md bg-white border border-outline-variant p-8 rounded-xl text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-bold text-primary">ส่งคำขอสำเร็จเรียบร้อย!</h2>
            <p className="text-xs text-secondary leading-relaxed">
              คำขอเบิกพัสดุของคุณได้รับการบันทึกและส่งไปยังเจ้าหน้าที่พัสดุเรียบร้อยแล้ว คุณสามารถตรวจสอบความคืบหน้าได้ที่หน้าหลัก
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:opacity-90 transition-all active:scale-95"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 md:pb-8 md:pl-20">
      
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
        <button 
          onClick={onClose}
          className="text-xs text-secondary hover:underline"
        >
          ยกเลิก
        </button>
      </header>

      {/* Main Flow Form Area */}
      <main className="pt-24 px-4 max-w-2xl mx-auto space-y-6">
        
        {/* Progress Stepper Line */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-highest -z-10 -translate-y-1/2"></div>
            {STEPS.map((stepName, index) => (
              <div key={stepName} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-background text-xs font-bold transition-all duration-300 ${
                  index <= currentStep 
                    ? "bg-primary text-white" 
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}>
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className={`text-[10px] font-bold ${index === currentStep ? "text-primary font-bold" : "text-secondary"}`}>
                  {stepName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Dynamic Steps rendering */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* STEP 1: Equipment Selection */}
          {currentStep === 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-primary">Equipment Selection</h2>
                <p className="text-xs text-secondary">Choose the primary gear category for your request.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Helmet Card */}
                <div 
                  onClick={() => setCategory("Helmet")}
                  className={`cursor-pointer border p-5 rounded-xl bg-white flex flex-col items-center text-center gap-3 transition-all hover:bg-surface-container-low ${
                    category === "Helmet" ? "border-primary bg-primary-fixed shadow-md" : "border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">engineering</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-primary">Helmet</h4>
                    <p className="text-xs text-secondary">Flight protection systems</p>
                  </div>
                </div>

                {/* G-Suit Card */}
                <div 
                  onClick={() => setCategory("G-Suit")}
                  className={`cursor-pointer border p-5 rounded-xl bg-white flex flex-col items-center text-center gap-3 transition-all hover:bg-surface-container-low ${
                    category === "G-Suit" ? "border-primary bg-primary-fixed shadow-md" : "border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">apparel</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-primary">G-Suit</h4>
                    <p className="text-xs text-secondary">Anti-gravity compression gear</p>
                  </div>
                </div>

                {/* Oxygen Mask Card */}
                <div 
                  onClick={() => setCategory("Oxygen Mask")}
                  className={`cursor-pointer border p-5 rounded-xl bg-white flex flex-col items-center text-center gap-3 transition-all hover:bg-surface-container-low ${
                    category === "Oxygen Mask" ? "border-primary bg-primary-fixed shadow-md" : "border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">air</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-primary">Oxygen Mask</h4>
                    <p className="text-xs text-secondary">Breathing and comms systems</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: Details */}
          {currentStep === 1 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-primary">Request Details</h2>
                <p className="text-xs text-secondary">Specify the quantity and justification for this request.</p>
              </div>

              <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-secondary uppercase block" htmlFor="qty">Quantity</label>
                  <input 
                    id="qty"
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-secondary uppercase block" htmlFor="reason">Reason for Request</label>
                  <textarea 
                    id="reason"
                    rows={4}
                    placeholder="e.g., Equipment damaged during routine training flight, expired service life..."
                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 3: Attachments */}
          {currentStep === 2 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-primary">Documentation</h2>
                <p className="text-xs text-secondary">Attach any relevant damage reports or certificates (Optional).</p>
              </div>

              <div className="border-2 border-dashed border-outline-variant bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors">
                <CloudUpload className="w-10 h-10 text-secondary mb-2" />
                <p className="text-xs font-semibold text-primary">Drag and drop files or <span className="text-primary underline">browse</span></p>
                <p className="text-[10px] text-secondary mt-1">PDF, PNG, JPG (Max 10MB)</p>
              </div>

              {/* Simulated uploaded file preview as in SCREEN 3 */}
              <div className="bg-white border border-outline-variant p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-semibold">Training_Damage_Report.pdf</span>
                </div>
                <button type="button" className="text-error hover:bg-error-container/30 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {/* STEP 4: Submit Review */}
          {currentStep === 3 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-primary">Review and Submit</h2>
                <p className="text-xs text-secondary">Please verify your request details before submission.</p>
              </div>

              <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-secondary block">Equipment Category:</span>
                    <span className="font-semibold text-primary block">{category}</span>
                  </div>
                  <div>
                    <span className="text-secondary block">Requested Quantity:</span>
                    <span className="font-semibold text-primary block">{quantity} Unit(s)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-secondary block">Reason:</span>
                    <p className="font-sans text-primary leading-relaxed">{reason || "คำขอสับเปลี่ยนอุปกรณ์สำหรับการซ้อมบิน"}</p>
                  </div>
                </div>

                <div className="bg-primary-container/20 text-primary p-3 rounded-lg flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                  <p className="text-[11px] leading-relaxed">
                    เมื่อคุณยืนยันส่งคำขอ ข้อมูลนี้จะถูกบันทึกในฐานข้อมูลคลัง และแจ้งเตือนไปยังเจ้าหน้าที่พัสดุและผู้มีอำนาจอนุมัติของฝูงบินทันที
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <button 
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-outline text-secondary font-bold text-xs rounded-lg hover:bg-surface-container active:scale-95 transition-all"
            >
              BACK
            </button>

            <button 
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="px-6 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all shadow"
            >
              {submitting ? "กำลังส่งคำขอ..." : currentStep === STEPS.length - 1 ? "SUBMIT REQUEST" : "NEXT"}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
