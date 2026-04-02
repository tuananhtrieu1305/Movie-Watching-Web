import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../hooks/useAuth";
import { getGoogleCredential } from "../utils/googleAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRedirectPath = (user) => {
    if (user?.role === "admin") return "/admin";
    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await register({ username, email, password });
      navigate(getRedirectPath(data?.user), { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
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
    <AuthLayout title="Tạo tài khoản mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Input */}
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-300 block pl-1"
          >
            Tên đăng nhập
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="user123"
            required
          />
        </div>

        {/* Email Input */}
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

        {/* Password Input */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-300 block pl-1"
          >
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-gray-300 block pl-1"
          >
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="Nhập lại mật khẩu"
            required
          />
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-400 pl-1">{errorMessage}</p>
        ) : null}

        {/* Register Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 mt-2 bg-[#ffdd95] hover:bg-[#ffe6aa] text-gray-900 font-bold rounded-lg transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ffdd95]/50"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
        </button>

        {/* Social Login (Rút gọn hơn ở trang Login) */}
        <div className="mt-4 grid grid-cols-1 gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors focus:outline-none"
          >
            <FcGoogle className="text-lg" />
            <span className="text-sm">Đăng ký bằng Google</span>
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#ffdd95] hover:text-[#ffe6aa] transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;