"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Building, DollarSign, Percent, Eye, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useOwners } from "@/hooks/use-owners"

export default function OwnersPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { data: owners, isLoading, error } = useOwners()

  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("q") || "")
  const [filteredOwners, setFilteredOwners] = useState<any[]>([])

  // Apply filters when search value changes
  useEffect(() => {
    if (!owners) return

    if (searchQuery) {
      const filtered = owners.filter(
        (owner) =>
          (owner.firstName + " " + owner.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
          owner.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredOwners(filtered)
    } else {
      setFilteredOwners(owners)
    }
  }, [searchQuery, owners])

  // Update URL with search parameter
  const updateSearchParams = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return "??"

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams(searchQuery)
    toast({
      description: searchQuery ? `Searching for "${searchQuery}"` : "Showing all owners",
    })
  }

  const handleDeleteOwner = (ownerId: string) => {
    // In a real app, this would call an API to delete the owner
    toast({
      title: "Owner Deleted",
      description: `Owner ID ${ownerId} has been removed.`,
      variant: "destructive",
    })
  }

  // Transform owner data for display
  const transformedOwners = filteredOwners.map((owner) => ({
    ...owner,
    name: `${owner.firstName} ${owner.lastName}`.trim(),
    // Default values for properties that might be missing
    properties: owner.properties || 0,
    revenue: owner.revenue || 0,
    occupancy: owner.occupancy || 0,
  }))

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Property Owners</h1>
          <p className="text-muted-foreground mt-1">Manage all property owners and their units</p>
        </div>
        <Button className="flex items-center gap-2" asChild>
          <Link href="/owners/add">
            <PlusCircle className="h-4 w-4" />
            Add New Owner
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{owners?.length || 0}</div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {transformedOwners.reduce((acc, owner) => acc + (owner.properties || 0), 0)}
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(transformedOwners.reduce((acc, owner) => acc + (owner.revenue || 0), 0))}
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <div className="relative">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search owner by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {searchQuery && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {transformedOwners.length} {transformedOwners.length === 1 ? "owner" : "owners"} found
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                updateSearchParams("")
              }}
            >
              Clear Search
            </Button>
          </div>
        )}
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">Loading owners...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500">Failed to load owners data</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all property owners and their details.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Revenue (YTD)</TableHead>
                <TableHead>Avg. Occupancy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedOwners.length > 0 ? (
                transformedOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={owner.avatar || undefined} />
                        <AvatarFallback>{getInitials(owner.name)}</AvatarFallback>
                      </Avatar>
                      <span>{owner.name}</span>
                    </TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.properties || 0}</TableCell>
                    <TableCell>{formatCurrency(owner.revenue || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>{owner.occupancy || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/owners/${owner.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/owners/edit/${owner.id}`}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the owner {owner.name} and all associated data. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOwner(owner.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No owners found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
