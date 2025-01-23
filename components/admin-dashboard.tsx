'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PackageList } from "@/components/package-list"
import { AddOnList } from "@/components/add-on-list"
import { getPackages } from "@/lib/rental-config"
import { useState, useEffect } from "react"
import type { Package } from "@/lib/types"

export function AdminDashboard() {
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    const loadPackages = async () => {
      const data = await getPackages()
      setPackages(data)
    }
    loadPackages()
  }, [])

  return (
    <Tabs defaultValue="packages" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="packages">Packages</TabsTrigger>
        <TabsTrigger value="addons">Add-ons</TabsTrigger>
      </TabsList>
      <TabsContent value="packages">
        <PackageList packages={packages} />
      </TabsContent>
      <TabsContent value="addons">
        <AddOnList />
      </TabsContent>
    </Tabs>
  )
}

