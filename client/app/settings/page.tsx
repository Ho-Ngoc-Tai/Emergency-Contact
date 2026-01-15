'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [autoCall, setAutoCall] = useState(true);

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log('Saving settings:', { phoneNumber, autoCall });
    alert('Cài đặt đã được lưu!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-green-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 text-white">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Cài đặt</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-600">
            <div className="space-y-1.5">
              <div className="h-1 w-8 rounded bg-white"></div>
              <div className="h-1 w-8 rounded bg-white"></div>
              <div className="h-1 w-8 rounded bg-white"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Số điện thoại khẩn cấp
          </h2>
          <p className="text-sm text-teal-200">
            Nhập số điện thoại chúng tôi sẽ gọi nếu bạn
            <br />
            không điểm danh đúng giờ.
          </p>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-teal-200">
            Số điện thoại khẩn cấp
          </label>
          <div className="flex items-center gap-3 rounded-xl bg-teal-800/50 px-4 py-3">
            <Phone className="h-5 w-5 text-teal-300" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="flex-1 bg-transparent text-white placeholder-teal-400 outline-none"
            />
          </div>
        </div>

        {/* Auto Call Toggle */}
        <div className="mb-12 rounded-xl bg-teal-800/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Tự động gọi điện</div>
              <div className="text-sm text-teal-300">
                Hệ thống sẽ tự động gọi điện số này
              </div>
            </div>
            <button
              onClick={() => setAutoCall(!autoCall)}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                autoCall ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                  autoCall ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full rounded-full bg-green-500 py-4 font-semibold text-white shadow-lg transition-all hover:bg-green-600"
        >
          Lưu cài đặt liên lạc
        </button>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-xs text-teal-300">
          <p className="flex items-center justify-center gap-1">
            <span className="text-teal-400">ⓘ</span>
            Phí duy trì là 30.000 VNĐ/tháng cho dịch vụ gọi điện khẩn cấp.
          </p>
          <p className="mt-1">
            Bằng việc nhấn nút, bạn đồng ý với điều khoản sử dụng và chính sách
            bảo mật của chúng tôi.
          </p>
        </div>
      </main>
    </div>
  );
}
