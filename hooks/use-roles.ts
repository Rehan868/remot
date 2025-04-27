"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export type Role = {
  id: string
  name: string
  description: string | null
  users_count?: number
  created_at: string
  updated_at: string
}

// Hook for fetching all roles
export function useRoles() {
  const [data, setData] = useState<Role[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get roles from Supabase
      const { data: roles, error: rolesError } = await supabase.from("roles").select("*").order("name")

      if (rolesError) throw rolesError

      // Get user count for each role
      const rolesWithUserCount = await Promise.all(
        roles.map(async (role) => {
          const { count, error: countError } = await supabase
            .from("user_roles")
            .select("*", { count: "exact", head: true })
            .eq("role_id", role.id)

          return {
            ...role,
            users_count: count || 0,
          }
        }),
      )

      setData(rolesWithUserCount)
    } catch (err) {
      console.error("Error fetching roles:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return { data, isLoading, error, refetch: fetchRoles }
}

// Hook for fetching a single role
export function useRole(id: string) {
  const [data, setData] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchRole = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const { data: role, error: roleError } = await supabase.from("roles").select("*").eq("id", id).single()

      if (roleError) throw roleError

      // Get permissions for this role
      const { data: permissions, error: permissionsError } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", id)

      if (permissionsError) throw permissionsError

      setData({
        ...role,
        permissions: permissions.map((p) => p.permission_id),
      })
    } catch (err) {
      console.error("Error fetching role:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchRole()
  }, [fetchRole])

  return { data, isLoading, error, refetch: fetchRole }
}

// Function to save a role (create or update)
export async function saveRole(role: Partial<Role>, isUpdate = false): Promise<Role> {
  const supabase = createClientComponentClient<Database>()

  try {
    if (isUpdate && role.id) {
      // Update existing role
      const { data, error } = await supabase
        .from("roles")
        .update({
          name: role.name,
          description: role.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", role.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new role
      const { data, error } = await supabase
        .from("roles")
        .insert({
          name: role.name,
          description: role.description,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error("Error saving role:", error)
    throw error
  }
}

// Function to delete a role
export async function deleteRole(id: string): Promise<void> {
  const supabase = createClientComponentClient<Database>()

  try {
    const { error } = await supabase.from("roles").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting role:", error)
    throw error
  }
}

// Function to assign permissions to a role
export async function assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
  const supabase = createClientComponentClient<Database>()

  try {
    // First, remove all existing permissions for this role
    const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId)

    if (deleteError) throw deleteError

    // Then, add the new permissions
    if (permissionIds.length > 0) {
      const permissionsToInsert = permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      }))

      const { error: insertError } = await supabase.from("role_permissions").insert(permissionsToInsert)

      if (insertError) throw insertError
    }
  } catch (error) {
    console.error("Error assigning permissions:", error)
    throw error
  }
}
