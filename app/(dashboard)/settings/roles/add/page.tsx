"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Loader, Save, ArrowLeft } from "lucide-react"
import { logError, logInfo } from "@/lib/debug-utils"
import { saveRole } from "@/hooks/use-roles"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export default function AddRolePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [roleDescription, setRoleDescription] = useState("")

  // Define permission categories and permissions
  const permissionCategories = [
    {
      name: "Bookings",
      permissions: [
        { id: "bookings.view", name: "View Bookings", description: "Can view booking details" },
        { id: "bookings.create", name: "Create Bookings", description: "Can create new bookings" },
        { id: "bookings.edit", name: "Edit Bookings", description: "Can modify existing bookings" },
        { id: "bookings.delete", name: "Delete Bookings", description: "Can cancel or delete bookings" },
      ],
    },
    {
      name: "Rooms",
      permissions: [
        { id: "rooms.view", name: "View Rooms", description: "Can view room details" },
        { id: "rooms.create", name: "Create Rooms", description: "Can add new rooms" },
        { id: "rooms.edit", name: "Edit Rooms", description: "Can modify room details" },
        { id: "rooms.delete", name: "Delete Rooms", description: "Can remove rooms from the system" },
      ],
    },
    {
      name: "Users",
      permissions: [
        { id: "users.view", name: "View Users", description: "Can view user accounts" },
        { id: "users.create", name: "Create Users", description: "Can create new user accounts" },
        { id: "users.edit", name: "Edit Users", description: "Can modify user details" },
        { id: "users.delete", name: "Delete Users", description: "Can delete user accounts" },
      ],
    },
    {
      name: "Settings",
      permissions: [
        { id: "settings.view", name: "View Settings", description: "Can view system settings" },
        { id: "settings.edit", name: "Edit Settings", description: "Can modify system settings" },
      ],
    },
  ]

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roleName) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      logInfo("Roles", "Adding new role", {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
      })

      // Create a new role object
      const newRole = {
        id: `role-${Date.now()}`, // Generate a unique ID
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Save the role using our mock data function
      await saveRole(newRole)

      toast({
        title: "Role Added",
        description: `${roleName} has been added successfully.`,
      })

      // Navigate back to the settings page
      router.push("/settings?tab=users")
    } catch (error) {
      logError("Roles", "Error adding role", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add role",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Add New Role</h1>
        <p className="text-muted-foreground mt-1">Create a new role with specific permissions</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
              <CardDescription>Define the basic information for this role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name*</Label>
                <Input
                  id="role-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Front Desk Manager"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Describe the responsibilities of this role"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Select the permissions for this role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {permissionCategories.map((category) => (
                <div key={category.name} className="space-y-4">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-md">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, checked === true)}
                          disabled={isSubmitting}
                        />
                        <div>
                          <label htmlFor={permission.id} className="font-medium text-sm cursor-pointer">
                            {permission.name}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}

              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Permission Information</h4>
                <p className="text-sm text-blue-700">
                  Users with this role will only have access to the features you select above. You can modify these
                  permissions later.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 flex justify-end gap-4">
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/settings?tab=users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding Role...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Role
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
