import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { privacyData } from "../data/legalData";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
                <p className="text-sm text-white/60">Last updated: {privacyData.lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10">
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Your Privacy Matters
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              At S.T.A.R.T. (Secure, Trustworthy, And Real Ties), we take your privacy seriously. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our dating platform.
            </p>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-purple-300 text-sm font-medium">
                🔒 We are committed to protecting your privacy. We will never sell your personal 
                information to third parties. Your anonymity is preserved until you choose to reveal 
                your identity to matches.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {privacyData.sections.map((section, index) => (
              <section key={index} className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
                <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-white/70 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <p className="text-sm text-white/50 text-center">
              By using S.T.A.R.T., you acknowledge that you have read and understood this Privacy Policy 
              and agree to the collection, use, and disclosure of your information as described herein.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <button
            onClick={() => navigate("/terms")}
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Terms of Service
          </button>
          <span className="text-white/30">•</span>
          <button
            onClick={() => navigate("/")}
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Back to Home
          </button>
          <span className="text-white/30">•</span>
          <a
            href="mailto:privacy@startdating.app"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Contact Privacy Team
          </a>
        </div>
      </main>
    </div>
  );
}

