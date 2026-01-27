import { useNavigate } from "react-router-dom";
import { ChevronLeft, FileText, Mail } from "lucide-react";
import { termsData } from "../data/legalData";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#C5B4E3] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition border border-white/10"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-[#0A0A0F]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Terms of Service
                </h1>
                <p className="text-sm text-white/50">
                  Last updated: {termsData.lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-sm p-6 sm:p-10">
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Welcome to S.T.A.R.T.
            </h2>
            <p className="text-white/60 leading-relaxed">
              Please read these Terms of Service carefully before using our
              platform. These terms govern your access to and use of S.T.A.R.T.
              (Secure, Trustworthy, And Real Ties) and constitute a legally
              binding agreement between you and us.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {termsData.sections.map((section, index) => (
              <section
                key={index}
                className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-white/60 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="bg-[#C5B4E3]/10 border border-[#C5B4E3]/30 rounded-2xl p-6">
              <p className="text-sm text-white/70 text-center">
                By using S.T.A.R.T., you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <button
            onClick={() => navigate("/privacy")}
            className="text-[#C5B4E3] hover:text-[#B5A3D3] font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Privacy Policy
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={() => navigate("/")}
            className="text-[#C5B4E3] hover:text-[#B5A3D3] font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Back to Home
          </button>
          <span className="text-white/20">•</span>
          <a
            href="mailto:legal@startdating.app"
            className="text-[#C5B4E3] hover:text-[#B5A3D3] font-medium underline underline-offset-2 hover:underline-offset-4 transition-all flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" />
            Contact Legal Team
          </a>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-gradient-to-br from-[#C5B4E3]/10 to-[#B5A3D3]/10 border border-[#C5B4E3]/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/10">
              <FileText className="w-6 h-6 text-[#C5B4E3]" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">
                Questions about our Terms?
              </h3>
              <p className="text-sm text-white/60 mb-3">
                If you have any questions or concerns about these Terms of
                Service, our legal team is here to help.
              </p>
              <a
                href="mailto:legal@startdating.app"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-lg font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] transition-all shadow-sm text-sm"
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -10px);
          }
          50% {
            transform: translate(-5px, 5px);
          }
          75% {
            transform: translate(-10px, -5px);
          }
        }
      `}</style>
    </div>
  );
}
