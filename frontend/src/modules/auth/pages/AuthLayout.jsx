// src/modules/auth/pages/AuthLayout.jsx
import React from 'react';

import BG_IMAGE from '../../../assets/images/interstellar-astronaut-in-tesseract-8tedwkpzbsonqlwn.jpg';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden">

      {/* 1. Ảnh nền (Background) */}
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: '100% 100%',
          filter: 'blur(8px)'
        }}
      ></div>

      {/* 2. Lớp phủ tối (Overlay) - Đã giảm độ đậm để thấy ảnh */}
      <div className="absolute inset-0 z-0 bg-black/80"></div>

      {/* 3. Cái hộp chứa nội dung (Form) */}
      <div className="relative z-10 w-full max-w-md p-8 bg-black/70 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl mx-4">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-[#ffdd95] tracking-tighter drop-shadow-lg">
            NETFLICK
          </h1>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          {subtitle && <p className="text-gray-300 text-sm">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;