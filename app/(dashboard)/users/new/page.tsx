"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { addUser } from "@/hooks/use-users"
import { Loader } from "lucide-react"
import { useRoles } from "@/hooks/use-roles"

type UserFormData = {
  name: string
  email: string
  role: string
  password: string
  confirmPassword: string
  sendInvite: boolean
}

export default function UserAddPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles()
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    sendInvite: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      sendInvite: checked,
    })
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Add user to database
      const result = await addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password, // Pass the password to the hook
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to add user")
      }

      toast({
        title: "User Added",
        description: `${formData.name} has been added successfully.${
          formData.sendInvite ? " An invitation email has been sent." : ""
        }`,
      })

      router.push("/users")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New User</h1>
        <p className="text-muted-foreground mt-1">Create a new user account and set permissions</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Enter the user's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter user's full name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role*</Label>
                <Select onValueChange={handleRoleChange} required disabled={isSubmitting || rolesLoading}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesError ? (
                      <SelectItem value="error" disabled>
                        Error loading roles
                      </SelectItem>
                    ) : rolesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-roles" disabled>
                        No roles found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {rolesError && <p className="text-sm text-red-500">Failed to load roles: {rolesError.message}</p>}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password*</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password*</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Preview</CardTitle>
              <CardDescription>How the user will appear in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-4">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarFallback className="text-xl">{getInitials(formData.name)}</AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{formData.name || "New User"}</h3>
                <p className="text-muted-foreground">{formData.email || "email@example.com"}</p>
                {formData.role && (
                  <Badge className="mt-2" variant="outline">
                    {formData.role}
                  </Badge>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="sendInvite"
                    checked={formData.sendInvite}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="sendInvite"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send invitation email
                  </label>
                </div>

                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-800 mb-2">Role Information</h4>
                  <div className="text-sm text-blue-700">
                    {formData.role === "Admin" && (
                      <p>Admins have full access to all features and can manage other users.</p>
                    )}
                    {formData.role === "Booking Agent" && (
                      <p>Booking Agents can create and manage bookings, but cannot access financial information.</p>
                    )}
                    {formData.role === "Owner" && (
                      <p>Owners can view their properties and bookings, but cannot make changes to the system.</p>
                    )}
                    {formData.role === "Cleaning Staff" && (
                      <p>Cleaning Staff can update room cleaning status but have limited access to other features.</p>
                    )}
                    {formData.role === "Maintenance" && (
                      <p>Maintenance staff can manage maintenance requests and update their status.</p>
                    )}
                    {!formData.role && <p>Select a role to see information about its permissions.</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 flex justify-end gap-4">
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding User...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
