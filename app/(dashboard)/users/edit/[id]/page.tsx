"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader } from "lucide-react"
import { useUser, updateUser } from "@/hooks/use-users"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRoles } from "@/hooks/use-roles"

const userFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    role: z.string(),
    avatar_url: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    confirmPassword: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password && data.password !== data.confirmPassword) {
        return false
      }
      return true
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )

type UserFormValues = z.infer<typeof userFormSchema>

export default function UserEditPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: user, isLoading, error, refetch } = useUser(id || "")
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      avatar_url: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        avatar_url: user.avatar_url || "",
        password: "",
        confirmPassword: "",
      })
    }
  }, [user, form])

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true)

      // Create a new object without the confirmPassword field
      const { confirmPassword, ...userData } = values

      // Only include password if it's not empty
      if (!userData.password) {
        delete userData.password
      }

      const result = await updateUser(id, userData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update user")
      }

      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      })

      // Refresh the user data
      await refetch()

      router.push(`/users/${id}`)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading user data...</span>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Error loading user: {error?.message || "User not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/users")}>
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground mt-1">Modify user information</p>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : roles && roles.length > 0 ? (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Front Desk">Front Desk</SelectItem>
                          <SelectItem value="Cleaning Staff">Cleaning Staff</SelectItem>
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
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter avatar URL (optional)"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6 border-t mt-6">
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password (optional)"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Leave blank to keep the current password.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href={`/users/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
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
