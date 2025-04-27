"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2, Loader, Calendar, Mail, Clock } from "lucide-react"
import { useUser, deleteUser } from "@/hooks/use-users"
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
import { format } from "date-fns"

export default function UserDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: user, isLoading, error } = useUser(id || "")
  const { toast } = useToast()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrator":
        return "bg-blue-100 text-blue-800"
      case "Manager":
        return "bg-green-100 text-green-800"
      case "Front Desk":
        return "bg-purple-100 text-purple-800"
      case "Cleaning Staff":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteUser(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete user")
      }

      toast({
        title: "User Deleted",
        description: "User has been removed successfully.",
      })

      router.push("/users")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/users/edit/${user.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the user account for {user.name}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Basic user information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
              ) : (
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              )}
            </Avatar>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge className={`mt-3 ${getRoleColor(user.role)}`} variant="outline">
              {user.role}
            </Badge>

            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.created_at && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Joined {format(new Date(user.created_at), "MMMM d, yyyy")}</span>
                </div>
              )}
              {user.last_active && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Last active {format(new Date(user.last_active), "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Detailed information about this user account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                <p className="mt-1">{user.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p className="mt-1">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <p className="mt-1">{user.role}</p>
              </div>
              {user.user_type && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User Type</h3>
                  <p className="mt-1 capitalize">{user.user_type}</p>
                </div>
              )}
              {user.created_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{format(new Date(user.created_at), "PPpp")}</p>
                </div>
              )}
              {user.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="mt-1">{format(new Date(user.updated_at), "PPpp")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
