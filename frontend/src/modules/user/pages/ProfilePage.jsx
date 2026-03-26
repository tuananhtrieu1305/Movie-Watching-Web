import React from 'react';
import { FaUser, FaPencilAlt, FaExclamationTriangle } from 'react-icons/fa';

const ProfilePage = () => {
    return (
        <div>
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
                <FaUser className="text-xl text-white" />
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            </div>

            {/* Form Container */}
            <div className="bg-[#2a2a2d] rounded-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-lg">

                {/* --- LEFT COLUMN: INPUTS --- */}
                <div className="md:col-span-2 space-y-6">

                    {/* Email Field */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                        <input
                            type="email"
                            defaultValue="student@gmail.com"
                            className="w-full bg-white text-gray-900 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                        />
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            You will be able to change the email ONCE ONLY. So please update your account with your Correct email address.
                        </p>
                    </div>

                    {/* Not Verified Warning Box */}
                    <div className="bg-[#1f1f22] border border-gray-700 rounded p-4 flex gap-3 items-start">
                        <FaExclamationTriangle className="text-gray-500 mt-1" />
                        <div>
                            <h4 className="text-gray-400 font-bold text-sm">Not Verified</h4>
                            <p className="text-white text-sm mt-1">
                                Your account has not been verified. <span className="text-yellow-500 cursor-pointer hover:underline">Click here</span> to resend verification email.
                            </p>
                        </div>
                    </div>

                    {/* Name Field */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Name</label>
                        <input
                            type="text"
                            defaultValue="vinhngu"
                            className="w-full bg-white text-gray-900 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                        />
                    </div>

                    {/* Joined Date Field (Read Only) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Joined</label>
                        <div className="w-full bg-[#1f1f22] text-gray-400 rounded px-4 py-2.5 border border-gray-700">
                            20/10/2025
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded transition-colors">
                            Save Changes
                        </button>
                    </div>

                </div>

                {/* --- RIGHT COLUMN: AVATAR --- */}
                <div className="md:col-span-1 flex flex-col items-center pt-2">
                    <div className="relative group cursor-pointer">
                        {/* Avatar Image */}
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2a2a2d] shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Edit Icon Button */}
                        <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors text-gray-800">
                            <FaPencilAlt size={14} />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Click icon to upload new avatar.<br />Max size: 2MB.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;