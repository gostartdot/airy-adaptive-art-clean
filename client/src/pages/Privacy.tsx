import { useNavigate } from "react-router-dom";
import { ChevronLeft, Shield, Lock, Mail } from "lucide-react";
import { privacyData } from "../data/legalData";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-200 transition border border-gray-200"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Privacy Policy
                </h1>
                <p className="text-sm text-gray-500">
                  Last updated: {privacyData.lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-10">
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Your Privacy Matters
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At S.T.A.R.T. (Secure, Trustworthy, And Real Ties), we take your
              privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              dating platform.
            </p>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Lock className="w-5 h-5 text-rose-600" />
                </div>
                <p className="text-gray-700 text-sm font-medium">
                  We are committed to protecting your privacy. We will never
                  sell your personal information to third parties. Your
                  anonymity is preserved until you choose to reveal your
                  identity to matches.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {privacyData.sections.map((section, index) => (
              <section
                key={index}
                className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
              <p className="text-sm text-gray-700 text-center">
                By using S.T.A.R.T., you acknowledge that you have read and
                understood this Privacy Policy and agree to the collection, use,
                and disclosure of your information as described herein.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <button
            onClick={() => navigate("/terms")}
            className="text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Terms of Service
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={() => navigate("/")}
            className="text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
          >
            Back to Home
          </button>
          <span className="text-gray-300">•</span>
          <a
            href="mailto:privacy@startdating.app"
            className="text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" />
            Contact Privacy Team
          </a>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Shield className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Questions about Privacy?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If you have any questions or concerns about how we handle your
                data, our privacy team is here to help.
              </p>
              <a
                href="mailto:privacy@startdating.app"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-sm text-sm"
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </a>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-rose-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              End-to-End Encryption
            </h4>
            <p className="text-xs text-gray-600">
              Your messages are always secure
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              Anonymous Matching
            </h4>
            <p className="text-xs text-gray-600">
              Control when to reveal yourself
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-rose-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              No Data Selling
            </h4>
            <p className="text-xs text-gray-600">Your data is never sold</p>
          </div>
        </div>
      </main>
    </div>
  );
}
