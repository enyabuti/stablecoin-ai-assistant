/**
 * Admin Health Panel
 * 
 * Comprehensive system monitoring dashboard with real-time metrics,
 * alerts, DLQ management, and safety controls.
 */

"use client";

import dynamic from 'next/dynamic';

// Lazy load heavy components to improve build performance
const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  loading: () => <div className="flex items-center justify-center h-64">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading admin panel...</span>
    </div>
  </div>,
  ssr: false
});

export default function AdminPage() {
  return <AdminDashboard />;
}