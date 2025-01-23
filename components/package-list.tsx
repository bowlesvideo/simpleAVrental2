'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Package {
  id: string
  name: string
  description: string
  price: number
  slug: string
}

interface PackageListProps {
  packages: Package[]
}

export function PackageList({ packages }: PackageListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card key={pkg.slug}>
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${pkg.price}</p>
          </CardContent>
          <CardFooter>
            <Link href={`/checkout?package=${pkg.slug}`} passHref>
              <Button className="w-full">Select</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

