import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Lock, CreditCard, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planPrice?: string;
}

interface PaymentFormData {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

export function CheckoutModal({ isOpen, onClose, onSuccess, planPrice = "$19" }: CheckoutModalProps) {
  const [step, setStep] = useState<"plan" | "payment" | "processing" | "success">("plan");
  
  const reset = () => {
    setStep("plan");
    onClose();
  };

  const handlePaymentSuccess = () => {
    setStep("success");
    setTimeout(() => {
      onSuccess();
      reset();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={reset}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <Card className="w-full max-w-lg pointer-events-auto shadow-2xl border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={reset} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {step === "plan" && (
                <PlanSelection onContinue={() => setStep("payment")} price={planPrice} />
              )}

              {step === "payment" && (
                <PaymentForm 
                  price={planPrice} 
                  onBack={() => setStep("plan")}
                  onSubmit={() => setStep("processing")}
                />
              )}

              {step === "processing" && (
                <ProcessingState onComplete={handlePaymentSuccess} />
              )}

              {step === "success" && (
                <SuccessState />
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PlanSelection({ onContinue, price }: { onContinue: () => void, price: string }) {
  return (
    <>
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-8 pt-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
        <div className="mx-auto bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">Upgrade to Pro Career</CardTitle>
        <CardDescription className="text-base mt-2">
          Unlock the full potential of your resume and land that dream job.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex items-end justify-center gap-1 mb-2">
          <span className="text-4xl font-bold text-slate-900">{price}</span>
          <span className="text-slate-500 mb-1">/ one-time</span>
        </div>
        
        <div className="space-y-3">
          {[
            "Remove Watermarks from PDF",
            "Download Editable Word (DOCX) File",
            "Unlimited AI Resume Re-writes",
            "Priority ATS Keyword Analysis",
            "Access to Cover Letter Builder"
          ].map((feature, i) => (
            <div key={i} className="flex items-center text-sm text-slate-700">
              <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 md:p-8 pt-0">
        <Button size="lg" className="w-full shadow-lg shadow-emerald-200" onClick={onContinue}>
          Unlock Premium Features
        </Button>
      </CardFooter>
    </>
  );
}

function PaymentForm({ price, onBack, onSubmit }: { price: string, onBack: () => void, onSubmit: () => void }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PaymentFormData>();
  
  // Format card number with spaces
  const cardNumberValue = watch("cardNumber");

  const onValidSubmit = (data: PaymentFormData) => {
    onSubmit();
  };

  return (
    <>
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-slate-500" />
          Secure Checkout
        </CardTitle>
        <CardDescription>
          Complete your purchase of <strong>{price}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 overflow-y-auto">
        <form id="payment-form" onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input 
              id="cardName" 
              placeholder="J. Doe"
              {...register("cardName", { required: "Name is required" })}
              className={cn(errors.cardName && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.cardName && <span className="text-xs text-red-500">{errors.cardName.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input 
                id="cardNumber" 
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                {...register("cardNumber", { 
                  required: "Card number is required",
                  pattern: {
                    value: /^[0-9\s]{13,19}$/,
                    message: "Invalid card format"
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                  }
                })}
                className={cn("pl-10", errors.cardNumber && "border-red-500 focus-visible:ring-red-500")}
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {errors.cardNumber && <span className="text-xs text-red-500">{errors.cardNumber.message}</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate" 
                placeholder="MM/YY"
                maxLength={5}
                {...register("expiryDate", { 
                  required: "Required",
                  pattern: {
                    value: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
                    message: "Use MM/YY"
                  },
                  onChange: (e) => {
                     // Auto-slash logic
                     let val = e.target.value.replace(/\D/g, '');
                     if (val.length >= 2) {
                        val = val.substring(0,2) + '/' + val.substring(2,4);
                     }
                     e.target.value = val;
                  }
                })}
                className={cn(errors.expiryDate && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.expiryDate && <span className="text-xs text-red-500">{errors.expiryDate.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Input 
                  id="cvc" 
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  {...register("cvc", { 
                    required: "Required", 
                    pattern: {
                      value: /^[0-9]{3,4}$/,
                      message: "3-4 digits"
                    }
                  })}
                  className={cn(errors.cvc && "border-red-500 focus-visible:ring-red-500")}
                />
              </div>
              {errors.cvc && <span className="text-xs text-red-500">{errors.cvc.message}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-md mt-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Payments are processed securely. No real money will be charged (Demo).
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="p-6 border-t border-slate-100 flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" form="payment-form" className="flex-1 shadow-md shadow-emerald-100">
          Pay {price}
        </Button>
      </CardFooter>
    </>
  );
}

function ProcessingState({ onComplete }: { onComplete: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 min-h-[400px]">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">Processing Payment...</h3>
      <p className="text-sm text-slate-500">Please do not close this window.</p>
    </CardContent>
  );
}

function SuccessState() {
  return (
    <CardContent className="flex flex-col items-center justify-center py-12 space-y-6 min-h-[400px] text-center">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        type="spring"
        className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </motion.div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
        <p className="text-slate-500 mt-2">Your pro features are now active.</p>
      </div>
    </CardContent>
  );
}
