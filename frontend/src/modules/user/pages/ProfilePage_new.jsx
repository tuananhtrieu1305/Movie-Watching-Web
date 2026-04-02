import { useState } from "react";
import { FaUser, FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../auth/hooks/useAuth";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.username && !formData.newPassword) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập ít nhất một trường (username hoặc mật khẩu mới)",
      });
      return false;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu",
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {};

      if (formData.username && formData.username !== user?.username) {
        payload.username = formData.username;
      }

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setMessage({ type: "info", text: "Không có thay đổi nào" });
        setLoading(false);
        return;
      }

      await updateProfile(payload);
      setMessage({
        type: "success",
        text: "Cập nhật hồ sơ thành công!",
      });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Cập nhật thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section: Profile Info */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <FaUser className="text-xl text-white" />
          <h2 className="text-2xl font-bold text-white">Thông tin tài khoản</h2>
        </div>

        <div className="bg-[#2a2a2d] rounded-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-lg">
          {/* LEFT: INFO */}
          <div className="md:col-span-2 space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-gray-600 text-gray-300 rounded px-4 py-2.5 outline-none cursor-not-allowed font-medium"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email không thể thay đổi
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập mới"
                className="w-full bg-white text-gray-900 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
              />
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Ngày tham gia
              </label>
              <div className="w-full bg-[#1f1f22] text-gray-400 rounded px-4 py-2.5 border border-gray-700">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("vi-VN")
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* RIGHT: AVATAR */}
          <div className="md:col-span-1 flex flex-col items-center pt-2">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2a2a2d] shadow-xl">
                <img
                  src={
                    user?.avatar_url ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300"
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors text-gray-800">
                <FaPencilAlt size={14} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Click biểu tượng để tải ảnh đại diện mới.
              <br />
              Tối đa 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Change Password */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <FaUser className="text-xl text-white" />
          <h2 className="text-2xl font-bold text-white">Thay đổi mật khẩu</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg max-w-2xl">
          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-300 border border-green-500"
                  : message.type === "error"
                    ? "bg-red-500/20 text-red-300 border border-red-500"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full bg-white text-gray-900 rounded px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full bg-white text-gray-900 rounded px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full bg-white text-gray-900 rounded px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-600 disabled:cursor-not-allowed text-black font-bold py-2.5 px-6 rounded transition-colors"
              >
                {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
