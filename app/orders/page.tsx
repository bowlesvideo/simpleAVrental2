'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'

interface Order {
  id: string
  orderDate: string
  eventDate: string
  total: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  eventDetails: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Orders</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Order #</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const eventDetails = JSON.parse(order.eventDetails)
              return (
                <TableRow 
                  key={order.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/orders/id/${order.id}`)}
                >
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{format(new Date(order.orderDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(order.eventDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{eventDetails.companyName || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 