'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateAddOnPrice } from '@/app/actions'
import { getAddOns } from '@/lib/rental-config'
import type { AddOn } from '@/lib/types'

export function AddOnList() {
  const [addOns, setAddOns] = useState<AddOn[]>([])

  useEffect(() => {
    const loadAddOns = async () => {
      const data = await getAddOns()
      setAddOns(data)
    }
    loadAddOns()
  }, [])

  const handlePriceChange = async (value: string, newPrice: number) => {
    try {
      await updateAddOnPrice(value, newPrice)
      setAddOns(addOns.map(addon => 
        addon.value === value ? { ...addon, price: newPrice } : addon
      ))
    } catch (error) {
      console.error('Failed to update add-on price:', error)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Add-on Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price ($)</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {addOns.map((addon) => (
          <TableRow key={addon.value}>
            <TableCell>{addon.name}</TableCell>
            <TableCell>{addon.description}</TableCell>
            <TableCell>
              <Input 
                type="number" 
                value={addon.price} 
                onChange={(e) => {
                  const newAddOns = addOns.map(a => 
                    a.value === addon.value ? { ...a, price: Number(e.target.value) } : a
                  )
                  setAddOns(newAddOns)
                }}
                className="w-24"
              />
            </TableCell>
            <TableCell>
              <Button onClick={() => handlePriceChange(addon.value, addon.price)}>
                Update
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

