"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useExpense, updateExpense } from "@/hooks/use-expenses"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useProperties } from "@/hooks/use-properties"

const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  property: z.string().min(1, "Property is required"),
  vendor: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
})

export default function ExpenseEditPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: expense, isLoading, error } = useExpense(id || "")
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: properties, isLoading: propertiesLoading } = useProperties()

  const form = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: "",
      category: "",
      property: "",
      vendor: "",
      payment_method: "",
      notes: "",
    },
    mode: "onChange",
  })

  // Update form values when expense data is loaded
  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: Number.parseFloat(expense.amount.toString()),
        date: expense.date,
        category: expense.category,
        property: expense.property,
        vendor: expense.vendor || "",
        payment_method: expense.payment_method || "",
        notes: expense.notes || "",
      })
    }
  }, [expense, form])

  const onSubmit = async (values: z.infer<typeof expenseFormSchema>) => {
    try {
      setIsSubmitting(true)

      const { data, error } = await updateExpense(id, values)

      if (error) throw error

      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully.",
      })

      router.push(`/expenses/${id}`)
    } catch (error) {
      console.error("Error updating expense:", error)
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading expense details...</span>
      </div>
    )
  }

  if (error || !expense) {
    return (
      <div className="text-center p-8 border rounded-lg bg-red-50">
        <p className="text-red-600">Error loading expense</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/expenses">Back to Expenses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/expenses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Expense</h1>
          <p className="text-muted-foreground mt-1">Modify expense information</p>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="property"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertiesLoading ? (
                          <SelectItem value="" disabled>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Auto-Payment">Auto-Payment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional notes (optional)" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href={`/expenses/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  )
}
