import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/operations/authAPI";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(formData.email, formData.password, navigate, dispatch);
  };
  const { user, isAuthenticated, isLoading } = useSelector((state: any) => state.auth);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If user is admin, redirect to admin panel
      if (user?.role === 'Admin') {
        navigate("/admin");
      } else {
        // Regular users should not use this login page
        navigate("/home");
      }
    }
  }, [isAuthenticated, isLoading, user?.role, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* <p className="text-sm text-gray-500 text-center mt-6">
          Don't have an Account?{" "}
          <NavLink to="/signup" className="text-blue-600 hover:underline">
            Signup here
          </NavLink>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
