"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createExpense } from "@/hooks/use-expenses"
import { useProperties } from "@/hooks/use-properties"
import { useFormat } from "@/hooks/use-format"

export default function ExpenseAddPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: properties, isLoading: propertiesLoading } = useProperties()
  const { getCurrencyCode } = useFormat()

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    property: "",
    vendor: "",
    payment_method: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.description || !formData.amount || !formData.category || !formData.property) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const expenseData = {
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        date: format(date, "yyyy-MM-dd"),
        category: formData.category,
        property: formData.property,
        vendor: formData.vendor || null,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
      }

      const { success, data, error } = await createExpense(expenseData)

      if (!success || error) {
        throw new Error(error || "Failed to add expense")
      }

      toast({
        title: "Expense Added",
        description: `${formData.description} has been successfully added.`,
      })

      // Navigate back to expenses list
      router.push("/expenses")
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Expense</h1>
        <p className="text-muted-foreground mt-1">Track a new expense for your property</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Enter information about this expense</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of the expense"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount*</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">
                      {getCurrencyCode() === 'AED' ? 'د.إ' : getCurrencyCode() === 'USD' ? '$' : 
                       getCurrencyCode() === 'EUR' ? '€' : getCurrencyCode() === 'GBP' ? '£' : 
                       getCurrencyCode() === 'CAD' ? 'C$' : getCurrencyCode() === 'AUD' ? 'A$' : 
                       getCurrencyCode() === 'JPY' ? '¥' : '$'}
                    </span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date*</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select value={formData.category} onValueChange={handleSelectChange("category")} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Personnel">Personnel</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Property*</Label>
                  <Select value={formData.property} onValueChange={handleSelectChange("property")} required>
                    <SelectTrigger id="property">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertiesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading properties...
                        </SelectItem>
                      ) : properties && properties.length > 0 ? (
                        <>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.name}>
                              {property.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="All Properties">All Properties</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Marina Tower">Marina Tower</SelectItem>
                          <SelectItem value="Downtown Heights">Downtown Heights</SelectItem>
                          <SelectItem value="All Properties">All Properties</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor/Supplier</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    placeholder="Name of vendor or supplier"
                    value={formData.vendor}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={handleSelectChange("payment_method")}>
                    <SelectTrigger id="payment_method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Auto-Payment">Auto-Payment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes about this expense"
                  className="min-h-[120px]"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receipt Upload</CardTitle>
                <CardDescription>Upload an image of your receipt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-muted-foreground mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supports: JPG, PNG, PDF (max 10MB)</p>
                  <Button variant="outline" className="mt-4">
                    Select File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Tips</CardTitle>
                <CardDescription>Guidelines for expense tracking</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p>• Keep all original receipts for at least 7 years</p>
                <p>• Categorize expenses correctly for tax purposes</p>
                <p>• Include detailed descriptions for audit compliance</p>
                <p>• Submit expenses within 30 days of purchase</p>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="lg:col-span-3 flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/expenses">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
