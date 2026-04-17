import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatbotWidget from "../ChatbotWidget";

const MainLayout = () => {
  const location = useLocation();
  const isMeetingPage = location.pathname.startsWith("/meeting");

  if (isMeetingPage) {
    return (
      <div className="h-screen w-screen bg-black overflow-hidden relative">
        <main className="h-full w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans app">
      <Header />
      <main className="flex-grow w-full app-main">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default MainLayout;
