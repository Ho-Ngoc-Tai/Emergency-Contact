'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions } from '@/store/auth/authSlice';
import { checkinActions } from '@/store/checkin/checkinSlice';
import { selectUser } from '@/store/auth/authSelectors';
import { selectCheckinStatus } from '@/store/checkin/checkinSelectors';
import { Menu, Settings as SettingsIcon } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectCheckinStatus);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng!';
    if (hour < 18) return 'Chào buổi chiều!';
    return 'Chào buổi tối!';
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    dispatch(checkinActions.getStatusRequest());
  }, [dispatch, router]);

  // Countdown timer and progress calculation
  useEffect(() => {
    if (!status?.nextCheckInDue) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(status.nextCheckInDue).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // Calculate progress (0-100%)
      const totalMs = 24 * 60 * 60 * 1000; // 24 hours
      const elapsedMs = totalMs - diff;
      const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
      setProgress(progressPercent);
    }, 1000);

    return () => clearInterval(interval);
  }, [status?.nextCheckInDue]);

  const handleCheckIn = () => {
    dispatch(checkinActions.recordCheckInRequest());
  };

  const handleLogout = () => {
    dispatch(authActions.logoutRequest());
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-900 to-green-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-900 to-green-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <button className="rounded-full p-2 text-white hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-sm font-medium uppercase tracking-wider text-teal-200">
          Điểm danh an toàn
        </h1>
        <button
          onClick={() => router.push('/settings')}
          className="rounded-full p-2 text-white hover:bg-white/10"
        >
          <SettingsIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        {/* Greeting */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">{getGreeting()}</h2>
          <p className="text-teal-200">Đã đến lúc điểm danh hôm nay</p>
        </div>

        {/* Menu Icon Circle */}
        <div className="mb-12 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-lg">
          <div className="space-y-2">
            <div className="h-1 w-10 rounded bg-teal-900"></div>
            <div className="h-1 w-10 rounded bg-teal-900"></div>
            <div className="h-1 w-10 rounded bg-teal-900"></div>
          </div>
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleCheckIn}
          className="group relative mb-8 flex h-64 w-64 items-center justify-center rounded-full bg-green-500 shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-center">
            <div className="mb-2 text-2xl font-bold text-teal-900">Tôi vẫn ổn</div>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 transition-opacity group-hover:opacity-20"></div>
        </button>

        {/* System Status Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full bg-teal-800/50 px-4 py-2 text-sm text-teal-200">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <span>Hệ thống đang hoạt động</span>
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-md">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-teal-300">CHU KỲ 24 GIỜ</span>
            <span className="font-semibold text-green-400">
              {Math.round(progress)}% đã hoàn thành
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-teal-800">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-xs text-teal-400">
            <span>00:00</span>
            <span>12:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-8 text-center">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-teal-300">
            Lần điểm danh cuối
          </div>
          <div className="flex items-center justify-center gap-2 text-4xl font-light text-white">
            <span className="font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-teal-400">:</span>
            <span className="font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-teal-400">:</span>
            <span className="font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Emergency Button */}
        <button className="mt-12 rounded-full bg-red-500/20 px-6 py-3 font-semibold text-red-300 ring-2 ring-red-500/50 transition-all hover:bg-red-500/30 hover:ring-red-500">
          🚨 KÍCH HOẠT KHẨN CẤP
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-teal-700/50 bg-teal-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-around px-6 py-4">
          <button className="flex flex-col items-center gap-1 text-green-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs">Điểm danh</span>
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="flex flex-col items-center gap-1 text-teal-300 hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <span className="text-xs">Cài đặt</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
