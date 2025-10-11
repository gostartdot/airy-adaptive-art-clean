import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { termsData } from "../data/legalData";

export default function Terms() {
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Terms of Service</h1>
                <p className="text-sm text-white/60">Last updated: {termsData.lastUpdated}</p>
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
              Welcome to S.T.A.R.T.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Please read these Terms of Service carefully before using our platform. 
              These terms govern your access to and use of S.T.A.R.T. (Secure, Trustworthy, 
              And Real Ties) and constitute a legally binding agreement between you and us.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {termsData.sections.map((section, index) => (
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
              By using S.T.A.R.T., you acknowledge that you have read, understood, and agree 
              to be bound by these Terms of Service.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <button
            onClick={() => navigate("/privacy")}
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Privacy Policy
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
            href="mailto:legal@startdating.app"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Contact Legal Team
          </a>
        </div>
      </main>
    </div>
  );
}

