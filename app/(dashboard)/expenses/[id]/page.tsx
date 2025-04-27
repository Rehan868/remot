"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, FileEdit, Loader2, Trash2 } from "lucide-react"
import { useExpense, deleteExpense } from "@/hooks/use-expenses"
import { Badge } from "@/components/ui/badge"
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
import { useState } from "react"
import { CurrencyDisplay } from "@/components/ui/currency-display"

export default function ExpenseViewPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: expense, isLoading, error } = useExpense(id || "")
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDeleteExpense = async () => {
    setIsDeleting(true)

    try {
      const { success, error } = await deleteExpense(id)

      if (error) throw error

      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      })

      router.push("/expenses")
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-600">Error loading expense details.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/expenses">Back to Expenses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/expenses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Expense Details</h1>
            <p className="text-muted-foreground mt-1">View expense information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/expenses/edit/${expense.id}`}>
              <FileEdit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this expense? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteExpense}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{expense.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">
                  <CurrencyDisplay amount={Number.parseFloat(expense.amount.toString())} />
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline">{expense.category}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">{expense.property}</p>
            </div>
            {expense.vendor && (
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{expense.vendor}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <Badge variant="outline" className="mt-1">
                {expense.payment_method || "Not specified"}
              </Badge>
            </div>
            {expense.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{expense.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {expense.created_at ? new Date(expense.created_at).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {expense.updated_at ? new Date(expense.updated_at).toLocaleString() : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
