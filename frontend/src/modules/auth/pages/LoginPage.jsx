// src/modules/auth/pages/LoginPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted (UI only)");
  };

  return (
    <AuthLayout title="Chào mừng trở lại!" >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300 block pl-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            defaultValue="student@gmail.com"
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="name@example.com"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center pl-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-300 block">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="text-xs text-[#ffdd95] hover:text-[#ffe6aa] hover:underline underline-offset-4">
              Quên mật khẩu?
            </Link>
          </div>
          <input
            type="password"
            id="password" h
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Login Button - Đã đổi sang màu vàng Golden xỉn */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#ffdd95] hover:bg-[#ffe6aa] text-gray-900 font-bold rounded-lg transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ffdd95]/50"
        >
          Đăng nhập ngay
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-gray-800 w-full absolute"></div>
          <span className="bg-transparent px-3 text-xs text-gray-500 relative z-10 uppercase tracking-wider">
            Hoặc tiếp tục với
          </span>
        </div>

        {/* Social Login Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <FcGoogle className="text-xl" />
          <span>Google</span>
        </button>
      </form>

      {/* Footer Link - Đã đổi sang màu vàng */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-[#ffdd95] hover:text-[#ffe6aa] transition-colors">
          Đăng ký miễn phí
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;