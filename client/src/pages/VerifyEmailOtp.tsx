import React, { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/operations/authAPI";

const VerifyEmailOtp: React.FC = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (value: string) => {
    setOtp(value);
  };

  const { signupData } = useSelector((state: any) => state.auth);
  useEffect(() => {
    if (!signupData) {
      navigate("/signup");
    }
  }, [signupData, navigate]);
  const { firstName, lastName, email, password, confirmPassword } = signupData || {};
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData) {
      alert("Signup data not found. Please try signing up again.");
      navigate("/signup");
      return;
    }
    
    if (otp.length !== 6) {
      alert("Please enter the full 6-digit OTP.");
      return;
    }
    
    signUp(
      "Admin",
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      navigate
    )(dispatch);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-2">
          Verify Your Email
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-500 mb-6">
          We've sent a 6-digit OTP to your email address. Please enter it below
          to verify.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6"
        >
          <OtpInput
            value={otp}
            onChange={handleChange}
            numInputs={6}
            shouldAutoFocus
            renderInput={(props) => (
              <input
                {...props}
                className="w-12 sm:w-14 h-12 sm:h-14 text-center text-xl sm:text-2xl border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-150"
              />
            )}
            containerStyle="flex gap-2 sm:gap-4 justify-center"
          />

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition duration-200"
          >
            Verify OTP
          </button>

          <p className="text-gray-500 text-sm text-center mt-4">
            Didn’t receive the code?{" "}
            <button
              type="button"
              className="text-purple-600 hover:text-purple-800 font-medium underline"
            >
              Resend OTP
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailOtp;
