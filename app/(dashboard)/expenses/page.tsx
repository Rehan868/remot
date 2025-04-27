"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  FileEdit,
  Loader2,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useFilteredExpenses, deleteExpense, type SortField, type SortDirection } from "@/hooks/use-expenses"
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
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CurrencyDisplay } from "@/components/ui/currency-display"

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [propertyFilter, setPropertyFilter] = useState<string>("all")
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const {
    data: expenses,
    isLoading,
    error,
    pagination,
    refetch,
  } = useFilteredExpenses(
    searchQuery,
    categoryFilter,
    dateFilter,
    propertyFilter,
    { page, pageSize },
    { field: sortField, direction: sortDirection },
  )

  const { toast } = useToast()
  const router = useRouter()

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return

    setIsDeleting(true)

    try {
      const { success, error } = await deleteExpense(expenseToDelete)

      if (error) throw error

      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      })

      // Refresh the data
      refetch()
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setExpenseToDelete(null)
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Default to descending for new field
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="h-4 w-4 ml-1" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const getCategoryBadge = (category: string) => {
    const colorMap: Record<string, string> = {
      Maintenance: "bg-blue-100 text-blue-800",
      Utilities: "bg-yellow-100 text-yellow-800",
      Personnel: "bg-purple-100 text-purple-800",
      Supplies: "bg-green-100 text-green-800",
      Insurance: "bg-orange-100 text-orange-800",
      Marketing: "bg-indigo-100 text-indigo-800",
      default: "bg-gray-100 text-gray-800",
    }

    return <Badge className={colorMap[category] || colorMap.default}>{category}</Badge>
  }

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const currentPage = pagination.page
    const totalPages = pagination.totalPages

    // Generate page numbers to display
    const pageNumbers = []
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Show ellipsis if not on first few pages
      if (currentPage > 3) {
        pageNumbers.push("ellipsis1")
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Show ellipsis if not on last few pages
      if (currentPage < totalPages - 2) {
        pageNumbers.push("ellipsis2")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) =>
            pageNum === "ellipsis1" || pageNum === "ellipsis2" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${pageNum}`}>
                <PaginationLink
                  isActive={currentPage === pageNum}
                  onClick={() => setPage(Number(pageNum))}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage all property expenses</p>
        </div>
        <Button asChild>
          <Link href="/expenses/add">
            <Plus className="h-4 w-4 mr-2" />
            Add New Expense
          </Link>
        </Button>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1) // Reset to first page on new search
              }}
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setPage(1) // Reset to first page on filter change
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Personnel">Personnel</SelectItem>
              <SelectItem value="Supplies">Supplies</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value)
              setPage(1) // Reset to first page on filter change
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={propertyFilter}
            onValueChange={(value) => {
              setPropertyFilter(value)
              setPage(1) // Reset to first page on filter change
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="Marina Tower">Marina Tower</SelectItem>
              <SelectItem value="Downtown Heights">Downtown Heights</SelectItem>
              <SelectItem value="All Properties">All Properties</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading expenses...</span>
        </div>
      ) : error ? (
        <div className="text-center p-8 border rounded-lg bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">Error loading expenses data.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg overflow-hidden border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left font-medium px-6 py-3">
                    <button
                      className="flex items-center font-medium focus:outline-none"
                      onClick={() => handleSort("description")}
                    >
                      Description
                      {getSortIcon("description")}
                    </button>
                  </th>
                  <th className="text-left font-medium px-6 py-3">
                    <button
                      className="flex items-center font-medium focus:outline-none"
                      onClick={() => handleSort("amount")}
                    >
                      Amount
                      {getSortIcon("amount")}
                    </button>
                  </th>
                  <th className="text-left font-medium px-6 py-3">
                    <button
                      className="flex items-center font-medium focus:outline-none"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      {getSortIcon("date")}
                    </button>
                  </th>
                  <th className="text-left font-medium px-6 py-3">
                    <button
                      className="flex items-center font-medium focus:outline-none"
                      onClick={() => handleSort("category")}
                    >
                      Category
                      {getSortIcon("category")}
                    </button>
                  </th>
                  <th className="text-left font-medium px-6 py-3">
                    <button
                      className="flex items-center font-medium focus:outline-none"
                      onClick={() => handleSort("property")}
                    >
                      Property
                      {getSortIcon("property")}
                    </button>
                  </th>
                  <th className="text-left font-medium px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses && expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{expense.description}</div>
                        {expense.vendor && <div className="text-sm text-muted-foreground">{expense.vendor}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <CurrencyDisplay amount={Number.parseFloat(expense.amount.toString())} />
                      </td>
                      <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getCategoryBadge(expense.category)}</td>
                      <td className="px-6 py-4">{expense.property}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/expenses/${expense.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/expenses/edit/${expense.id}`}>
                              <FileEdit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setExpenseToDelete(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
                                <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>Cancel</AlertDialogCancel>
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No expenses found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Page size selector and pagination */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-sm text-muted-foreground mr-2">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPage(1) // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-4">
                Showing {pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0} to{" "}
                {pagination && pagination.total > 0
                  ? Math.min(pagination.page * pagination.pageSize, pagination.total)
                  : 0}{" "}
                of {pagination?.total || 0} entries
              </span>
            </div>

            {renderPagination()}
          </div>
        </>
      )}
    </div>
  )
}
