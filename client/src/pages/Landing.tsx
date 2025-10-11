import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { authService } from "../services/authService";
import { useAuth } from "../store/useAuthStore";

function LandingContent() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const result = await authService.googleAuth(
        credentialResponse.credential
      );

      if (result.data.isNewUser) {
        navigate("/onboarding", {
          state: {
            googleId: result.data.googleId,
            email: result.data.email,
            name: result.data.name,
          },
        });
      } else {
        login(result.data.user, result.data.token);
        authService.setToken(result.data.token);
        navigate("/home");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      alert("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    alert("Failed to sign in with Google. Please try again.");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: "🎭",
      title: "Anonymous First",
      description:
        "Stay private until you're both ready to reveal. Real connections before appearances.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: "💎",
      title: "Credit System",
      description:
        "Thoughtful matching with daily credits. Quality over endless swiping.",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      icon: "⚡",
      title: "Real-Time Chat",
      description:
        "Instant messaging with people who actually want to connect.",
      gradient: "from-red-500 to-red-600",
    },
    {
      icon: "🔒",
      title: "Privacy Protected",
      description:
        "Your data stays yours. No selling, no tracking, no surveillance.",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      icon: "🎯",
      title: "Smart Matching",
      description:
        "AI-powered compatibility analysis based on what truly matters.",
      gradient: "from-rose-500 to-rose-600",
    },
    {
      icon: "✨",
      title: "Verified Profiles",
      description: "Real people, real profiles. No bots, no catfishing.",
      gradient: "from-amber-500 to-amber-600",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "10K+", label: "Matches Made" },
    { value: "4.8★", label: "User Rating" },
    { value: "95%", label: "Success Rate" },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Profile",
      description:
        "Sign up with Google and complete your anonymous profile with interests and personality.",
      icon: "👤",
    },
    {
      number: "02",
      title: "Get Matched",
      description:
        "Our algorithm finds compatible connections based on shared values and interests.",
      icon: "🤝",
    },
    {
      number: "03",
      title: "Start Chatting",
      description:
        "Connect through anonymous chat and get to know each other authentically.",
      icon: "💬",
    },
    {
      number: "04",
      title: "Reveal & Meet",
      description:
        "When you're both ready, reveal identities and take it to the next level.",
      icon: "✨",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-black/20 backdrop-blur-xl border-b border-white/10"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💕</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                S.T.A.R.T.
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-white/80 hover:text-white transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-white/80 hover:text-white transition"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("signup")}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center pt-16 sm:pt-20">
          <div className="mb-6 sm:mb-8">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-300 text-sm font-medium border border-white/20">
              Dating Reimagined for 2025
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Find Real Love
            </span>
            <br />
            <span className="text-white">Beyond The Surface</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Connect through personality, not photos. S.T.A.R.T. brings
            authenticity back to dating with anonymous profiles and meaningful
            conversations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16">
            <button
              onClick={() => scrollToSection("signup")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto px-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10"
              >
                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Full Height */}
      <section
        id="features"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                S.T.A.R.T.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto px-4">
              Experience dating the way it should be—authentic, secure, and
              focused on real connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-lg group-hover:shadow-2xl transition`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* How It's Different */}
          <div className="mt-16 sm:mt-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-6 sm:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Different By Design
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-lg sm:text-xl">
                        No Superficial Swiping
                      </h4>
                      <p className="text-white/60 text-sm sm:text-base">
                        Focus on personality and compatibility, not just looks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-lg sm:text-xl">
                        Quality Over Quantity
                      </h4>
                      <p className="text-white/60 text-sm sm:text-base">
                        Credit system ensures thoughtful, intentional
                        connections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-lg sm:text-xl">
                        Safe & Secure
                      </h4>
                      <p className="text-white/60 text-sm sm:text-base">
                        Anonymous until both parties are comfortable revealing
                        identity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/10">
                  <div className="text-4xl sm:text-6xl mb-4">🎯</div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    92% Match Success
                  </h4>
                  <p className="text-white/70 text-sm sm:text-base">
                    Users report higher satisfaction with matches compared to
                    traditional apps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Full Height */}
      <section
        id="how-it-works"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              How It{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto px-4">
              Four simple steps to finding meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 hover:border-white/20 transition group"
              >
                <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xl">
                  {step.number}
                </div>
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div
            id="signup"
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 sm:p-16 border border-white/10 text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join thousands of people finding real connections beyond the
              surface
            </p>

            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="mt-4 text-white/70">Setting up your account...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 inline-block border border-white/10">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width={window.innerWidth < 640 ? "280" : "320"}
                  />
                </div>
                <p className="text-xs sm:text-sm text-white/50 mt-6 sm:mt-8 max-w-md px-4">
                  By continuing, you agree to our{" "}
                  <a
                    href="#"
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/60 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No Data Selling</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💕</span>
              </div>
              <span className="text-xl font-bold text-white">S.T.A.R.T.</span>
            </div>
            <div className="text-white/50 text-sm text-center md:text-left">
              © 2025 S.T.A.R.T. Dating App. Secure, Trustworthy, And Real Ties.
              All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-white/50 hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="text-white/50 hover:text-white transition">
                Terms
              </a>
              <a href="#" className="text-white/50 hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Landing() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  if (!googleClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center p-8 bg-red-500/10 backdrop-blur-xl rounded-3xl border border-red-500/20 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Configuration Error
          </h2>
          <p className="text-white/70">
            Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID
            to your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LandingContent />
    </GoogleOAuthProvider>
  );
}
