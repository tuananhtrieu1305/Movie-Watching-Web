// src/modules/auth/pages/RegisterPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { FcGoogle } from 'react-icons/fc';

const RegisterPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register form submitted (UI only)");
  };

  return (
    <AuthLayout title="Tạo tài khoản mới" >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Username Input */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-300 block pl-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="user123"
            required
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300 block pl-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="name@example.com"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-300 block pl-1">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300 block pl-1">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirm-password"
            className="w-full px-4 py-3 rounded-lg bg-gray-950/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="Nhập lại mật khẩu"
            required
          />
        </div>

        {/* Register Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 mt-2 bg-[#ffdd95] hover:bg-[#ffe6aa] text-gray-900 font-bold rounded-lg transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ffdd95]/50"
        >
          Đăng ký tài khoản
        </button>

        {/* Social Login (Rút gọn hơn ở trang Login) */}
        <div className="mt-4 grid grid-cols-1 gap-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors focus:outline-none"
          >
            <FcGoogle className="text-lg" />
            <span className="text-sm">Đăng ký bằng Google</span>
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-[#ffdd95] hover:text-[#ffe6aa] transition-colors">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;