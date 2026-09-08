import React from "react";
import { Button } from "@/app/components/ui";
import { motion } from "motion/react";
import { CheckCircle, ArrowRight, Zap, Target, Award } from "lucide-react";

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800"
            >
              <Zap className="mr-2 h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
              AI-Powered Resume Mentor
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]"
            >
              Build a world-class resume <br className="hidden md:block" />
              <span className="text-emerald-600">tailored to your dream job</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl text-lg md:text-xl text-slate-600"
            >
              Stop guessing. Paste the job description, and let our AI mentor guide you to a perfect fit resume that passes the ATS and impresses recruiters.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4"
            >
              <Button size="lg" className="h-12 px-8 text-base shadow-emerald-200 shadow-xl" onClick={onGetStarted}>
                Build My Resume Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white">
                View Success Stories
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Why top candidates choose us</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We don't just format your resume. We engineer it for the specific role you're applying for.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target className="h-6 w-6 text-emerald-600" />}
              title="Job Description Match"
              description="Paste any JD and get an instant compatibility score with specific improvement suggestions."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
              title="ATS Optimization"
              description="Our templates are 100% ATS-friendly. No invisible tables or unreadable icons."
            />
            <FeatureCard 
              icon={<Award className="h-6 w-6 text-emerald-600" />}
              title="Mentor-Style Feedback"
              description="Get honest, constructive feedback on your bullet points, just like a career coach."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Start for free, upgrade for the full career toolkit.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="flex flex-col p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Free Starter</h3>
              <p className="text-slate-500 mt-2 mb-6">Perfect for your first resume.</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">$0</div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Build 1 resume
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Basic JD Analysis
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Watermarked PDF Download
                </li>
              </ul>
              <Button variant="outline" onClick={onGetStarted} className="w-full">Get Started Free</Button>
            </div>

            {/* Pro Tier */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pro Career</h3>
              <p className="text-slate-500 mt-2 mb-6">For serious job seekers.</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">$19<span className="text-lg font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Unlimited resumes
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Advanced AI Feedback
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Cover Letter Builder
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  Clean PDF + Word Download
                </li>
              </ul>
              <Button onClick={onGetStarted} className="w-full shadow-emerald-200 shadow-lg">Start Free Trial</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500">© 2026 VitaForge. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-emerald-600">Privacy</a>
            <a href="#" className="hover:text-emerald-600">Terms</a>
            <a href="#" className="hover:text-emerald-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-shadow hover:shadow-lg">
      <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
