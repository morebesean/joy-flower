import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  buyer_name: string
  total_amount: number
  status: string
  created_at: string
}

interface RecentOrdersTableProps {
  orders: Order[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return statusConfig[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
              Order Number
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
              Customer
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {order.order_number}
                </Link>
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {order.buyer_name}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                {formatCurrency(order.total_amount)}
              </td>
              <td className="py-3 px-4">
                <Badge className={getStatusBadge(order.status)}>
                  {order.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {formatDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
