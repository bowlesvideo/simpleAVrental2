'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Contact {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  status: string
  createdAt: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contact')
      if (!response.ok) throw new Error('Failed to fetch contacts')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      toast({
        title: "Status Updated",
        description: "Contact status has been updated successfully",
      })

      fetchContacts() // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      new: 'default',
      replied: 'success',
      archived: 'secondary'
    }
    return <Badge variant={variants[status] as any}>{status}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#072948]">Contact Submissions</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.company || '-'}</TableCell>
                <TableCell>{getStatusBadge(contact.status)}</TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate">{contact.message}</div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => window.location.href = `mailto:${contact.email}`}
                        className="cursor-pointer"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Reply via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(contact.id, 'replied')}
                        className="cursor-pointer"
                      >
                        Mark as Replied
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(contact.id, 'archived')}
                        className="cursor-pointer text-red-600"
                      >
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 