import React, { useState, useEffect } from "react";

// All texts for Arabic only
const TXT = {
    profileTitle: "الملف الشخصي للمستخدم",
    userName: "اسم المستخدم",
    email: "البريد الإلكتروني",
    update: "تحديث",
    updateMsg: "تم التحديث بنجاح (بدون أي تغيير حقيقي).",
    changePwd: "تغيير كلمة المرور",
    current: "كلمة المرور الحالية",
    new: "كلمة المرور الجديدة",
    confirm: "تأكيد كلمة المرور الجديدة",
    changeBtn: "تغيير كلمة المرور",
    changedMsg: "تم تغيير كلمة المرور بنجاح!",
    errFields: "جميع الحقول مطلوبة.",
    errShort: "يجب أن تحتوي كلمة المرور الجديدة على 6 أحرف على الأقل.",
    errMatch: "كلمات المرور غير متطابقة.",
    close: "✕",
};

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfile({ open, onClose }: UserProfileProps) {
  // Demo data
  const [user] = useState({
    name: "مستخدم تجريبي",
    email: "user@example.com",
  });

  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(TXT.updateMsg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(TXT.errFields);
      return;
    }

    if (newPassword.length < 6) {
      setError(TXT.errShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(TXT.errMatch);
      return;
    }

    // Success case
    setSuccess(TXT.changedMsg);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        dir="rtl"
      >
        <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
          <div 
            className="bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-bold">{TXT.profileTitle}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                type="button"
              >
                {TXT.close}
              </button>
            </div>

            <div className="p-4">
              {/* User Info Section */}
              <form onSubmit={handleUpdateProfile} className="mb-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-lg font-bold mb-2">
                    {TXT.userName}
                  </label>
                  <input
                    type="text"
                    className="gov-input text-lg w-full"
                    value={user.name}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-lg font-bold mb-2">
                    {TXT.email}
                  </label>
                  <input
                    type="email"
                    className="gov-input text-lg w-full"
                    value={user.email}
                    readOnly
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-lg"
                  >
                    {TXT.update}
                  </button>
                </div>
        </form>

              {/* Password Change Section */}
              <div className="border-t pt-4">
                <h3 className="text-xl font-bold mb-3">{TXT.changePwd}</h3>
                <form onSubmit={handleChangePassword}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg font-bold mb-2">
                      {TXT.current}
                    </label>
          <input
            type="password"
                      className="gov-input text-lg w-full"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg font-bold mb-2">
                      {TXT.new}
                    </label>
          <input
            type="password"
                      className="gov-input text-lg w-full"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg font-bold mb-2">
                      {TXT.confirm}
                    </label>
          <input
            type="password"
                      className="gov-input text-lg w-full"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 text-red-500 text-base">{error}</div>
                  )}
                  {success && (
                    <div className="mb-4 text-green-500 text-base">{success}</div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-lg"
                    >
                      {TXT.changeBtn}
                    </button>
                  </div>
        </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}