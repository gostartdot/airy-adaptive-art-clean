import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import {
  X,
  Shield,
  Zap,
  MessageCircle,
  Lock,
  Target,
  CheckCircle2,
  Eye,
  Users,
  Sparkles,
  UserPlus,
  ChevronDown,
  Check,
} from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../store/useAuthStore";
import { toast } from "sonner";

function LandingContent() {
  const navigate = useNavigate();
  const { login, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.role === "Admin") {
          navigate("/admin", { replace: true });
          return;
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }

    if (isAuthenticated && !hasNavigated) {
      setHasNavigated(true);
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate, hasNavigated]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      setIsLoading(true);

      logout();
      authService.removeToken();

      if (!credentialResponse.credential) {
        throw new Error("Credential not found");
      }

      const result = await authService.googleAuth(
        credentialResponse.credential
      );

      if (result.success && result.data.isNewUser) {
        setShowModal(false);
        setIsLoading(false);
        navigate("/onboarding", {
          state: {
            googleId: result.data.googleId,
            email: result.data.email,
            name: result.data.name,
          },
          replace: true,
        });
      } else if (result.success && !result.data.isNewUser) {
        login(result.data.user, result.data.token);
        authService.setToken(result.data.token);
        setShowModal(false);
        setIsLoading(false);
        setHasNavigated(true);
        navigate("/home", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      logout();
      authService.removeToken();

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to sign in with Google. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
      setShowModal(false);
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
      icon: Eye,
      title: "Anonymous First",
      description:
        "Stay private until both of you are ready to reveal. Build real connections based on personality before appearances.",
      color: "text-[#C5B4E3]",
      bg: "bg-[#C5B4E3]/10",
    },
    {
      icon: Sparkles,
      title: "Credit System",
      description:
        "Thoughtful matching with daily credits. Encourages quality connections over endless swiping.",
      color: "text-[#B5A3D3]",
      bg: "bg-[#B5A3D3]/10",
    },
    {
      icon: Zap,
      title: "Real-Time Chat",
      description:
        "Instant messaging with people who want to connect. Have meaningful conversations in real time.",
      color: "text-[#C5B4E3]",
      bg: "bg-[#C5B4E3]/10",
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description:
        "Your data stays yours. We do not sell your information or track you outside our platform.",
      color: "text-[#B5A3D3]",
      bg: "bg-[#B5A3D3]/10",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description:
        "Matching based on compatibility and shared interests. Find people who truly align with your values.",
      color: "text-[#C5B4E3]",
      bg: "bg-[#C5B4E3]/10",
    },
    {
      icon: CheckCircle2,
      title: "Verified Profiles",
      description:
        "Real people with verified profiles. We work to prevent fake accounts and ensure authenticity.",
      color: "text-[#B5A3D3]",
      bg: "bg-[#B5A3D3]/10",
    },
  ];

  const stats = [
    { value: "Anonymous", label: "Identity Protected", icon: Shield },
    { value: "Real-Time", label: "Instant Messaging", icon: MessageCircle },
    { value: "Quality", label: "Thoughtful Matches", icon: Target },
    { value: "Secure", label: "Data Protection", icon: Lock },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Profile",
      description:
        "Sign up with Google and complete your profile with your interests and personality traits.",
      icon: UserPlus,
    },
    {
      number: "02",
      title: "Get Matched",
      description:
        "Our system finds compatible connections based on shared values and interests.",
      icon: Users,
    },
    {
      number: "03",
      title: "Start Chatting",
      description:
        "Connect through chat and get to know each other authentically without pressure.",
      icon: MessageCircle,
    },
    {
      number: "04",
      title: "Reveal Identity",
      description:
        "When both of you are ready, reveal your identity and take the connection further.",
      icon: Eye,
    },
  ];

  return (
    <div className="bg-[#0A0A0F] min-h-screen text-white">
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

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 30
            ? "bg-[#0A0A0F]/95 backdrop-blur-xl border-white/10 shadow-sm"
            : "bg-[#0A0A0F]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              
              <h2 className="text-2xl font-display font-semibold tracking-tight">
                <span className="text-lavender">go</span>
                <span className="text-foreground">ST</span>
                <span className="text-lavender">A</span>
                <span className="text-foreground">RT</span>
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-white/60 hover:text-white transition font-medium text-sm"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-white/60 hover:text-white transition font-medium text-sm"
              >
                How It Works
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] hover:from-[#B5A3D3] hover:to-[#A593C3] rounded-lg text-[#0A0A0F] font-medium shadow-sm hover:shadow-md transition-all"
              >
                Get Started
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="sm:hidden px-6 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] hover:from-[#B5A3D3] hover:to-[#A593C3] rounded-lg text-[#0A0A0F] font-medium shadow-sm hover:shadow-md transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C5B4E3]/5 via-[#0A0A0F] to-[#0A0A0F]"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#C5B4E3]/20 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#B5A3D3]/20 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center pt-24 ">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A0A0F]/80 backdrop-blur-xl rounded-full text-[#C5B4E3] text-sm font-medium border border-[#C5B4E3]/20 shadow-sm">
              <Shield className="w-4 h-4" />
              Secure, Trustworthy, And Real Ties
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Find Real Love
            <br />
            <span className="bg-gradient-to-r from-[#C5B4E3] to-[#E8DEFF] bg-clip-text text-transparent">
              Beyond The Surface
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Connect through personality, not photos. START brings authenticity
            back to dating with anonymous profiles and meaningful conversations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] hover:from-[#B5A3D3] hover:to-[#A593C3] rounded-lg text-[#0A0A0F] font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-lg text-white font-semibold text-lg border-2 border-white/10 hover:border-[#C5B4E3]/30 transition-all"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto px-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-6 sm:px-6 sm:py-8 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all hover:border-[#C5B4E3]/30 group"
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5B4E3] mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 break-words">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm break-words">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block">
            <button
              onClick={() => scrollToSection("features")}
              className="animate-bounce"
            >
              <ChevronDown className="w-6 h-6 text-[#C5B4E3]/60" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-[#0A0A0F]"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-[#C5B4E3] to-[#E8DEFF] bg-clip-text text-transparent">
                START
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Experience dating the way it should be. Authentic, secure, and
              focused on real connections between real people.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#C5B4E3]/30 hover:shadow-xl hover:bg-white/10 transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 ${feature.bg} backdrop-blur-xl rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10`}
                  >
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Comparison Section */}
          <div className="mt-24 bg-gradient-to-br from-white/5 to-[#C5B4E3]/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                  Different By Design
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#C5B4E3]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-[#C5B4E3]/30">
                      <Check className="w-5 h-5 text-[#C5B4E3]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-lg">
                        No Superficial Swiping
                      </h4>
                      <p className="text-white/60">
                        Focus on personality and compatibility first, not just
                        physical appearance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#C5B4E3]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-[#C5B4E3]/30">
                      <Check className="w-5 h-5 text-[#C5B4E3]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-lg">
                        Quality Over Quantity
                      </h4>
                      <p className="text-white/60">
                        Credit system encourages thoughtful and intentional
                        connections with real people
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#C5B4E3]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-[#C5B4E3]/30">
                      <Check className="w-5 h-5 text-[#C5B4E3]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-lg">
                        Safe and Secure
                      </h4>
                      <p className="text-white/60">
                        Your identity remains anonymous until both people are
                        comfortable revealing it
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-lg">
                  <Target className="w-16 h-16 text-[#C5B4E3] mb-4" />
                  <h4 className="text-2xl font-bold text-white mb-3">
                    Quality Matches
                  </h4>
                  <p className="text-white/60">
                    Focus on meaningful connections with people who share your
                    values and interests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-[#0A0A0F] to-[#0A0A0F]"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              How It{" "}
              <span className="bg-gradient-to-r from-[#C5B4E3] to-[#E8DEFF] bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Four simple steps to finding meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-10 border border-white/10 hover:border-[#C5B4E3]/30 hover:shadow-xl hover:bg-white/10 transition-all group"
                >
                  <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-xl flex items-center justify-center text-[#0A0A0F] font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  <Icon className="w-12 h-12 text-[#C5B4E3] mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div
            id="signup"
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-16 border border-white/10 shadow-lg text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Join people who believe in finding real connections beyond the
              surface. Start meaningful conversations today.
            </p>

            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 border-4 border-[#C5B4E3]/20 border-t-[#C5B4E3] rounded-full animate-spin" />
                <p className="mt-4 text-white/60">Setting up your account...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 inline-block border border-white/10 shadow-sm">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    size="large"
                    text="signin_with"
                    shape="square"
                    width={window.innerWidth < 640 ? "280" : "320"}
                  />
                </div>
                <p className="text-sm text-white/50 mt-8 max-w-md">
                  By continuing, you agree to our{" "}
                  <button
                    onClick={() => navigate("/terms")}
                    className="text-[#C5B4E3] hover:text-[#B5A3D3] transition underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    onClick={() => navigate("/privacy")}
                    className="text-[#C5B4E3] hover:text-[#B5A3D3] transition underline"
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C5B4E3]" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#C5B4E3]" />
                <span>No Data Selling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C5B4E3]" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#15151F] backdrop-blur-xl rounded-3xl p-8 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10"
            style={{
              animation: "scaleIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                Welcome to START
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-0 -right-2 text-white/40 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 border-4 border-[#C5B4E3]/20 border-t-[#C5B4E3] rounded-full animate-spin" />
                <p className="mt-4 text-white/60">Setting up your account...</p>
              </div>
            ) : (
              <>
                <button className="w-full p-0 mb-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg py-3 transition-colors border border-gray-200">
                  <div className="flex gap-3 justify-center items-center w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                </button>

                <div className="mt-6 text-xs text-white/50 text-center">
                  <p>By continuing, you agree to our</p>
                  <div className="flex justify-center gap-4 mt-1">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        navigate("/terms");
                      }}
                      className="text-[#C5B4E3] hover:text-[#B5A3D3] underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
                    >
                      Terms of Service
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        navigate("/privacy");
                      }}
                      className="text-[#C5B4E3] hover:text-[#B5A3D3] underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
                    >
                      Privacy Policy
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-[#0A0A0F] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl text-[#0A0A0F] font-bold tracking-tight">
                    S
                  </span>
                </div>
              </div>
              <span className="text-xl font-bold text-white">START</span>
            </div>
            <div className="text-white/50 text-sm text-center md:text-left">
              © 2025 START Dating App. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => navigate("/privacy")}
                className="text-white/50 hover:text-white transition font-medium"
              >
                Privacy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-white/50 hover:text-white transition font-medium"
              >
                Terms
              </button>
              <a
                href="mailto:contact@startdating.app"
                className="text-white/50 hover:text-white transition font-medium"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

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

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default function Landing() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  if (!googleClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center p-8 bg-[#C5B4E3]/10 backdrop-blur-xl rounded-3xl border border-[#C5B4E3]/20 max-w-md">
          <h2 className="text-2xl font-bold text-[#C5B4E3] mb-4">
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
