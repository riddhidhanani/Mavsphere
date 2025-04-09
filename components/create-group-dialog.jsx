import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [connections, setConnections] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/networking/connections");
        if (response.ok) {
          const data = await response.json();
          setConnections(data);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    if (open) {
      fetchConnections();
    }
  }, [open]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      const response = await fetch("/api/networking/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          participantIds: selectedUsers,
        }),
      });

      if (response.ok) {
        const group = await response.json();
        onGroupCreated(group);
        onOpenChange(false);
        setGroupName("");
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <ScrollArea className="h-[300px] pr-4">
            {connections.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 py-2">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => {
                    setSelectedUsers((prev) =>
                      checked
                        ? [...prev, user.id]
                        : prev.filter((id) => id !== user.id)
                    );
                  }}
                />
                <Avatar>
                  <AvatarImage src={user.profile?.avatarUrl} />
                  <AvatarFallback>
                    {`${user.firstName[0]}${user.lastName[0]}`}
                  </AvatarFallback>
                </Avatar>
                <span>{`${user.firstName} ${user.lastName}`}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
