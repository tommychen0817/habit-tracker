"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import type { HabitCompletion } from "@/lib/api"

interface CompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habitName: string
  completion?: HabitCompletion
  onSave: (data: { description?: string }) => void
  onDelete?: () => void
}

export function CompletionDialog({
  open,
  onOpenChange,
  habitName,
  completion,
  onSave,
  onDelete,
}: CompletionDialogProps) {
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (open) {
      setDescription(completion?.description || "")
    }
  }, [open, completion])

  const handleSave = () => {
    onSave({ description: description.trim() || undefined })
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {completion ? "Edit" : "Complete"} {habitName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description / Notes (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Read 'The Great Gatsby' Chapter 3, Learned about React hooks, Ran 5km in the park..."
              className="resize-none"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {completion && onDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{completion ? "Update" : "Complete"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
