"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Loader, Save, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { saveRoom, deleteRoom } from "@/hooks/use-rooms"
import { useProperties } from "@/hooks/use-properties"
import { useRoomTypes } from "@/hooks/use-room-types"

// Form schema
const roomFormSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  property_id: z.string().min(1, "Property is required"),
  room_type_id: z.string().min(1, "Room type is required"),
  floor: z.string().min(1, "Floor is required"),
  maxOccupancy: z.string().min(1, "Max occupancy is required"),
  basePrice: z.string().min(1, "Base price is required"),
  description: z.string().optional(),
  amenities: z.string().optional(),
})

type RoomFormValues = z.infer<typeof roomFormSchema>

interface AddEditRoomFormProps {
  mode: "add" | "edit"
  roomData?: any
}

export function AddEditRoomForm({ mode, roomData }: AddEditRoomFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: properties = [], isLoading: propertiesLoading } = useProperties()
  const { data: roomTypes = [], isLoading: roomTypesLoading } = useRoomTypes()

  // Setup form with default values
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomNumber: "",
      property_id: "",
      room_type_id: "",
      floor: "1",
      maxOccupancy: "",
      basePrice: "",
      description: "",
      amenities: "",
    },
  })

  // Set form values when editing or when data is loaded
  useEffect(() => {
    if (mode === "edit" && roomData) {
      console.log("Setting form values with roomData:", roomData)

      // Ensure amenities is properly formatted
      let amenitiesString = ""
      if (roomData.amenities) {
        if (Array.isArray(roomData.amenities)) {
          amenitiesString = roomData.amenities.join("\n")
        } else if (typeof roomData.amenities === "string") {
          amenitiesString = roomData.amenities
        }
      }

      form.reset({
        roomNumber: roomData.number || "",
        property_id: roomData.property_id || "",
        room_type_id: roomData.room_type_id || "",
        floor: roomData.floor?.toString() || "1",
        maxOccupancy: roomData.capacity?.toString() || "",
        basePrice: roomData.rate?.toString() || "",
        description: roomData.description || "",
        amenities: amenitiesString,
      })
    }
  }, [form, mode, roomData])

  const onSubmit = async (data: RoomFormValues) => {
    try {
      setIsSubmitting(true)

      // Prepare amenities array from newline-separated string
      const amenitiesArray = data.amenities ? data.amenities.split("\n").filter((item) => item.trim() !== "") : []

      // Prepare room data for saving
      const roomToSave = {
        id: mode === "edit" ? roomData?.id : undefined,
        number: data.roomNumber,
        property_id: data.property_id,
        room_type_id: data.room_type_id,
        floor: Number.parseInt(data.floor, 10),
        capacity: Number.parseInt(data.maxOccupancy, 10),
        rate: Number.parseFloat(data.basePrice),
        description: data.description || "",
        amenities: amenitiesArray,
      }

      const result = await saveRoom(roomToSave, mode === "edit")

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to save room")
      }

      toast({
        title: `Room ${mode === "add" ? "created" : "updated"} successfully`,
        description: `Room ${data.roomNumber} has been ${mode === "add" ? "added to" : "updated in"} the system.`,
      })

      // Redirect to the rooms list page
      router.push("/rooms")
    } catch (error) {
      console.error("Error saving room:", error)
      toast({
        title: "Error",
        description: `Failed to ${mode === "add" ? "create" : "update"} room. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (mode === "edit" && roomData?.id) {
      try {
        setIsDeleting(true)
        const result = await deleteRoom(roomData.id)

        if (!result.success) {
          throw new Error(result.error?.message || "Failed to delete room")
        }

        toast({
          title: "Room deleted",
          description: `Room ${roomData.number} has been removed from the system.`,
        })

        router.push("/rooms")
      } catch (error) {
        console.error("Error deleting room:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete room. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCancel = () => {
    // If we have roomData, we go back to the room detail view, otherwise to the rooms list
    if (mode === "edit" && roomData) {
      router.push(`/rooms/${roomData.id}`)
    } else {
      router.push("/rooms")
    }
  }

  if (propertiesLoading || roomTypesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/rooms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{mode === "add" ? "Add New Room" : "Edit Room"}</h1>
            <p className="text-muted-foreground mt-1">
              {mode === "add" ? "Create a new room in the system" : `Modifying room ${roomData?.number}`}
            </p>
          </div>
        </div>
        {mode === "edit" && (
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="h-4 w-4" />
                Delete Room
              </>
            )}
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the essential details for this room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map((roomType) => (
                            <SelectItem key={roomType.id} value={roomType.id}>
                              {roomType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxOccupancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Occupancy</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Add more information about the room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter a description of the room" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List amenities, one per line" rows={3} {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter amenities separated by line breaks (e.g., WiFi, TV, Mini-fridge)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {mode === "add" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === "add" ? "Create Room" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
