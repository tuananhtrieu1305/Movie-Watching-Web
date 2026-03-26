import React from 'react';
import { FaCog } from 'react-icons/fa';

const SettingsPage = () => {
    return (
        <div>
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
                <FaCog className="text-xl text-white" />
                <h2 className="text-2xl font-bold text-white">Settings</h2>
            </div>

            {/* Content */}
            <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg space-y-6">

                {/* Language Setting */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Language</label>
                    <select className="w-full bg-white text-gray-900 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 font-medium">
                        <option>Tiếng Việt</option>
                        <option>English</option>
                    </select>
                </div>

                {/* Theme Setting */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Theme</label>
                    <select className="w-full bg-white text-gray-900 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 font-medium">
                        <option>Dark</option>
                        <option>Light</option>
                    </select>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded transition-colors">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
