"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import {
  updateUserProfile,
  updateUserPassword,
  updateNotificationPreferences,
  updateTwoFactorAuth,
} from "@/app/actions/profile-actions"
import { Spinner } from "@/components/ui/spinner"

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { data: profileData, isLoading, error, refetch } = useProfile()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    avatar_url: "",
  })

  const [notificationPreferences, setNotificationPreferences] = useState<Record<string, boolean>>({
    email: true,
    browser: true,
    mobile: false,
    bookings: true,
    system: true,
    marketing: false,
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        position: profileData.position || "",
        avatar_url: profileData.avatar_url || "/avatars/01.png",
      })

      if (profileData.notification_preferences) {
        setNotificationPreferences(profileData.notification_preferences)
      }

      setTwoFactorEnabled(profileData.two_factor_enabled || false)
    }
  }, [profileData])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPassword({
      ...password,
      [name]: value,
    })
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]: checked,
    })
  }

  const handleTwoFactorChange = async (checked: boolean) => {
    if (!user?.id) return

    setIsSubmitting(true)

    try {
      const result = await updateTwoFactorAuth(user.id, checked)

      if (result.success) {
        setTwoFactorEnabled(checked)
        toast({
          title: checked ? "Two-Factor Authentication Enabled" : "Two-Factor Authentication Disabled",
          description: result.message,
        })
        refetch()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update two-factor authentication",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)

    try {
      const result = await updateUserProfile(user.id, formData)

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.message || "Your profile information has been updated successfully.",
        })
        refetch()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    // Basic validation
    if (password.new !== password.confirm) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    if (password.new.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateUserPassword(user.id, password.current, password.new)

      if (result.success) {
        toast({
          title: "Password Changed",
          description: result.message || "Your password has been updated successfully.",
        })

        setPassword({
          current: "",
          new: "",
          confirm: "",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)

    try {
      const result = await updateNotificationPreferences(user.id, notificationPreferences)

      if (result.success) {
        toast({
          title: "Notification Preferences Updated",
          description: result.message || "Your notification settings have been saved.",
        })
        refetch()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update notification preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load profile data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error.message}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Job Title</Label>
                      <Input id="position" name="position" value={formData.position} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-2" size="sm" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Avatar</CardTitle>
                <CardDescription>Change your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-6">
                  <AvatarImage src={formData.avatar_url || "/placeholder.svg"} alt={formData.name} />
                  <AvatarFallback>
                    {formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="grid w-full gap-2">
                  <Button variant="outline" disabled>
                    Change Avatar
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    disabled
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorChange} disabled={isSubmitting} />
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-red-600">Log Out</h3>
                      <p className="text-sm text-muted-foreground mt-1">Log out of your account on this device</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    name="current"
                    type="password"
                    value={password.current}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input
                    id="new"
                    name="new"
                    type="password"
                    value={password.new}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Password requirements:</p>
                  <ul className="text-muted-foreground pl-4 space-y-1 list-disc">
                    <li>At least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2" size="sm" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationsSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Channels</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.browser}
                      onCheckedChange={(checked) => handleNotificationChange("browser", checked)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Mobile Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your mobile device</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.mobile}
                      onCheckedChange={(checked) => handleNotificationChange("mobile", checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Types</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Booking Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        New bookings, check-ins, check-outs, and cancellations
                      </p>
                    </div>
                    <Switch
                      checked={notificationPreferences.bookings}
                      onCheckedChange={(checked) => handleNotificationChange("bookings", checked)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">System Notifications</Label>
                      <p className="text-sm text-muted-foreground">System updates, maintenance, and important alerts</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.system}
                      onCheckedChange={(checked) => handleNotificationChange("system", checked)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Marketing Notifications</Label>
                      <p className="text-sm text-muted-foreground">Promotions, new features, and newsletters</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.marketing}
                      onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2" size="sm" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
