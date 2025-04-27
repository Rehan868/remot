"use client"

import { useState, useEffect, useCallback } from "react"
import type { Expense } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase"
import type { PostgrestError } from "@supabase/supabase-js"

// Add import for the audit logger
import { logActivity } from "@/lib/audit-logger"

// Pagination and sorting types
export type SortDirection = "asc" | "desc"
export type SortField = "date" | "amount" | "description" | "category" | "property"
export type PaginationParams = {
  page: number
  pageSize: number
}
export type SortParams = {
  field: SortField
  direction: SortDirection
}

// Hook for fetching all expenses with pagination and sorting
export function useExpenses(
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: "date", direction: "desc" },
) {
  const [data, setData] = useState<Expense[] | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | PostgrestError | null>(null)

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Calculate range for pagination
      const from = (pagination.page - 1) * pagination.pageSize
      const to = from + pagination.pageSize - 1

      // Get total count for pagination
      const { count, error: countError } = await supabase.from("expenses").select("*", { count: "exact", head: true })

      if (countError) throw countError

      // Fetch paginated and sorted data
      const { data: expensesData, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .order(sort.field, { ascending: sort.direction === "asc" })
        .range(from, to)

      if (fetchError) throw fetchError

      setData(expensesData)
      setTotal(count || 0)
    } catch (err) {
      console.error("Error fetching expenses:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, sort.field, sort.direction])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    data,
    isLoading,
    error,
    refetch: fetchExpenses,
    pagination: {
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  }
}

// Hook for fetching a single expense
export function useExpense(id: string) {
  const [data, setData] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | PostgrestError | null>(null)

  const fetchExpense = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: expense, error: fetchError } = await supabase.from("expenses").select("*").eq("id", id).single()

      if (fetchError) throw fetchError

      if (!expense) {
        throw new Error(`Expense with ID ${id} not found`)
      }

      setData(expense)
    } catch (err) {
      console.error("Error fetching expense:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchExpense()
  }, [fetchExpense])

  return { data, isLoading, error, refetch: fetchExpense }
}

// Hook for filtered expenses with pagination and sorting
export function useFilteredExpenses(
  searchQuery: string,
  categoryFilter: string,
  dateFilter: string,
  propertyFilter: string,
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: "date", direction: "desc" },
) {
  const [data, setData] = useState<Expense[] | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | PostgrestError | null>(null)

  const fetchFilteredExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Calculate range for pagination
      const from = (pagination.page - 1) * pagination.pageSize
      const to = from + pagination.pageSize - 1

      // Start building the query
      let query = supabase.from("expenses").select("*", { count: "exact" })

      // Apply search filter
      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,vendor.ilike.%${searchQuery}%`)
      }

      // Apply category filter
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter)
      }

      // Apply property filter
      if (propertyFilter && propertyFilter !== "all") {
        query = query.eq("property", propertyFilter)
      }

      // Apply date filter
      if (dateFilter && dateFilter !== "all") {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const thisYear = new Date(now.getFullYear(), 0, 1)

        if (dateFilter === "this-month") {
          query = query.gte("date", thisMonth.toISOString().split("T")[0])
        } else if (dateFilter === "last-month") {
          query = query
            .gte("date", lastMonth.toISOString().split("T")[0])
            .lt("date", thisMonth.toISOString().split("T")[0])
        } else if (dateFilter === "this-year") {
          query = query.gte("date", thisYear.toISOString().split("T")[0])
        }
      }

      // Get the count first
      const countQuery = query
      const { count, error: countError } = await countQuery

      if (countError) throw countError

      // Then get the paginated and sorted data
      const { data: expensesData, error: fetchError } = await query
        .order(sort.field, { ascending: sort.direction === "asc" })
        .range(from, to)

      if (fetchError) throw fetchError

      setData(expensesData)
      setTotal(count || 0)
    } catch (err) {
      console.error("Error fetching filtered expenses:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [
    searchQuery,
    categoryFilter,
    dateFilter,
    propertyFilter,
    pagination.page,
    pagination.pageSize,
    sort.field,
    sort.direction,
  ])

  useEffect(() => {
    fetchFilteredExpenses()
  }, [fetchFilteredExpenses])

  return {
    data,
    isLoading,
    error,
    refetch: fetchFilteredExpenses,
    pagination: {
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  }
}

// Function to update an expense
export async function updateExpense(id: string, expenseData: Partial<Expense>) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("expenses").update(expenseData).eq("id", id).select().single()

    if (error) throw error

    // Log the activity
    await logActivity({
      action: "update",
      entityType: "expense",
      entityId: id,
      details: `Updated expense: ${expenseData.description || data.description} (${expenseData.amount || data.amount})`,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error updating expense:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expense",
    }
  }
}

// Function to create a new expense
export async function createExpense(expenseData: Omit<Expense, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createClient()

    // Insert the new expense into the database
    const { data, error } = await supabase.from("expenses").insert([expenseData]).select().single()

    if (error) {
      console.error("Error creating expense:", error)
      throw error
    }

    // Log the activity
    await logActivity({
      action: "create",
      entityType: "expense",
      entityId: data.id,
      details: `Created expense: ${expenseData.description} (${expenseData.amount})`,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error creating expense:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    }
  }
}

// Function to delete an expense
export async function deleteExpense(id: string) {
  try {
    const supabase = createClient()

    // Get expense details for the audit log
    const { data: expenseData, error: fetchError } = await supabase
      .from("expenses")
      .select("description, amount")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase.from("expenses").delete().eq("id", id).select().single()

    if (error) throw error

    // Log the activity
    await logActivity({
      action: "delete",
      entityType: "expense",
      entityId: id,
      details: `Deleted expense: ${expenseData.description} (${expenseData.amount})`,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error deleting expense:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    }
  }
}
