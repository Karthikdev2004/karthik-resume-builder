import React, { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, CreditCard, Lock, X, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planPrice?: string;
}

export function CheckoutModal({ isOpen, onClose, onSuccess, planPrice = "$19" }: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    zip: ""
  });

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setErrors({});
      setFormData({ name: "", cardNumber: "", expiry: "", cvc: "", zip: "" });
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) newErrors.name = "Name on card is required";

    // Card Number (Luhn algorithm simplified / length check)
    const cleanCardNum = formData.cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanCardNum)) {
      newErrors.cardNumber = "Enter a valid 16-digit card number";
    }

    // Expiry Date (MM/YY)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = "Use MM/YY format";
    } else {
      // Check if expired
      const [month, year] = formData.expiry.split("/");
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = "Card has expired";
      }
    }

    // CVC
    if (!/^\d{3,4}$/.test(formData.cvc)) {
      newErrors.cvc = "Enter a valid CVC";
    }

    // Zip
    if (!/^\d{5}$/.test(formData.zip)) {
      newErrors.zip = "Enter a valid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    // Auto-format card number
    if (id === "cardNumber") {
      formattedValue = value.replace(/\D/g, "").substring(0, 16).replace(/(\d{4})/g, "$1 ").trim();
    }
    // Auto-format expiry
    else if (id === "expiry") {
      if (value.length === 2 && formData.expiry.length === 1) {
        formattedValue = value + "/";
      } else if (value.length === 2 && formData.expiry.length === 3) {
         formattedValue = value.substring(0, 1);
      } else {
        formattedValue = value;
      }
    }

    setFormData(prev => ({ ...prev, [id]: formattedValue }));
    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep("processing");
      // Simulate API call
      setTimeout(() => {
        setStep("success");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="pr-8">
              <CardTitle className="text-xl">Upgrade to Pro Career</CardTitle>
              <CardDescription>Unlock unlimited clean downloads and premium features.</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-900">Pro Monthly Plan</p>
                        <p className="text-xs text-emerald-700">Billed monthly, cancel anytime</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">{planPrice}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name on Card</Label>
                      <Input 
                        id="name" 
                        placeholder="Alex Candidate" 
                        value={formData.name}
                        onChange={handleInputChange}
                        className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input 
                          id="cardNumber" 
                          placeholder="0000 0000 0000 0000" 
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={cn("pl-10", errors.cardNumber && "border-red-500 focus-visible:ring-red-500")}
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      </div>
                      {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input 
                          id="expiry" 
                          placeholder="MM/YY" 
                          maxLength={5}
                          value={formData.expiry}
                          onChange={handleInputChange}
                          className={cn(errors.expiry && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <div className="relative">
                           <Input 
                            id="cvc" 
                            placeholder="123" 
                            maxLength={4}
                            value={formData.cvc}
                            onChange={handleInputChange}
                            className={cn(errors.cvc && "border-red-500 focus-visible:ring-red-500")}
                          />
                          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.cvc && <p className="text-xs text-red-500">{errors.cvc}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input 
                          id="zip" 
                          placeholder="12345" 
                          maxLength={5}
                          value={formData.zip}
                          onChange={handleInputChange}
                          className={cn(errors.zip && "border-red-500 focus-visible:ring-red-500")}
                        />
                         {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-emerald-200" size="lg">
                    Pay {planPrice} & Upgrade
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Lock className="h-3 w-3" />
                    Payments are secure and encrypted
                  </div>
                </motion.form>
              )}

              {step === "processing" && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 space-y-4"
                >
                  <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                  <p className="text-lg font-medium text-slate-900">Processing payment...</p>
                  <p className="text-sm text-slate-500">Please do not close this window.</p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 space-y-6 text-center"
                >
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
                    <p className="text-slate-500 mt-2">Welcome to Pro. Your premium features are now unlocked.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
