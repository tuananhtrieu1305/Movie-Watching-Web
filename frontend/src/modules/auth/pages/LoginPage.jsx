import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../hooks/useAuth";
import { getGoogleCredential } from "../utils/googleAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("student@gmail.com");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRedirectPath = (user) => {
    if (user?.role === "admin") return "/admin";
    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const data = await login({ email, password });
      navigate(getRedirectPath(data?.user), { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const credential = await getGoogleCredential(
        import.meta.env.VITE_GOOGLE_CLIENT_ID,
      );
      const data = await loginWithGoogle(credential);
      navigate(getRedirectPath(data?.user), { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Chào mừng trở lại!">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-300 block pl-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center pl-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300 block"
            >
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#ffdd95] hover:text-[#ffe6aa] hover:underline underline-offset-4"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-400 pl-1">{errorMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[#ffdd95] hover:bg-[#ffe6aa] text-gray-900 font-bold rounded-lg transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ffdd95]/50"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập ngay"}
        </button>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-gray-800 w-full absolute"></div>
          <span className="bg-transparent px-3 text-xs text-gray-500 relative z-10 uppercase tracking-wider">
            Hoặc tiếp tục với
          </span>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <FcGoogle className="text-xl" />
          <span>Google</span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#ffdd95] hover:text-[#ffe6aa] transition-colors"
        >
          Đăng ký miễn phí
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
