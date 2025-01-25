"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const OrdersPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check local storage for auth state on component mount
    const authState = localStorage.getItem('adminAuth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">SimpleAV Admin</span>
              <nav className="ml-10 flex space-x-4">
                <button
                  onClick={() => router.push('/admin')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Packages & Add-ons
                </button>
                <button
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white"
                >
                  Orders
                </button>
                <button
                  onClick={() => router.push('/admin/blog')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Blog
                </button>
                <button
                  onClick={() => router.push('/admin/inventory')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Inventory
                </button>
              </nav>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-gray-600 hover:text-gray-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">Order management interface coming soon...</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>View and manage rental orders</li>
                <li>Track order status and history</li>
                <li>Process payments and refunds</li>
                <li>Generate invoices and receipts</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 