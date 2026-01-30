import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">

            {/* 1. Header (Fixed position bên trong component Header) */}
            <Header />

            {/* 2. Main Content 
          - flex-grow: Đẩy Footer xuống đáy nếu nội dung ngắn
          - pt-20: Tạo khoảng trống bên trên để nội dung không bị Header che mất (vì Header là fixed)
          - min-h-screen: Đảm bảo trang luôn cao ít nhất bằng màn hình
      */}
            <main className="flex-grow w-full">
                {/* React Router sẽ render các page con (Home, Profile...) vào đây */}
                <Outlet />
            </main>

            {/* 3. Footer */}
            <Footer />

        </div>
    );
};

export default MainLayout;