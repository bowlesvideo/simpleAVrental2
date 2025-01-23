'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Package } from "@/lib/types"

interface PackageDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  package: Package
}

export function PackageDetailsModal({ isOpen, onClose, package: pkg }: PackageDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{pkg.name} - Full Specifications</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          {/* Equipment Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Equipment</h3>
            <ul className="space-y-2">
              {pkg.includedItems.filter(item => !item.includes("Hours") && !item.includes("Delivery")).map((item, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <svg className="w-4 h-4 mr-2 mt-1 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Staff Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Staff & Support</h3>
            <ul className="space-y-2">
              {pkg.includedItems.filter(item => 
                item.includes("Operator") || 
                item.includes("Engineer") || 
                item.includes("Director") || 
                item.includes("Manager")
              ).map((item, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <svg className="w-4 h-4 mr-2 mt-1 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Service Details</h3>
            <ul className="space-y-2">
              {pkg.includedItems.filter(item => 
                item.includes("Hours") || 
                item.includes("Delivery") || 
                item.includes("Setup") ||
                item.includes("Coverage")
              ).map((item, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <svg className="w-4 h-4 mr-2 mt-1 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 