import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "./NotificationsProvider";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead, refetchNotifications } = useNotifications();
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const { toast } = useToast();

  const handleNotificationClick = async (notification: any) => {
    if (notification.type === 'duplicate_goal') {
      setSelectedNotification(notification);
      setShowDuplicateDialog(true);
    }
    await markAsRead(notification.id);
  };

  const handleDeleteDuplicate = async () => {
    if (!selectedNotification?.metadata?.newGoalId) return;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', selectedNotification.metadata.newGoalId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete duplicate goal",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Duplicate goal deleted successfully",
      });
      setShowDuplicateDialog(false);
      refetchNotifications();
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <ScrollArea className="h-80">
            <div className="flex flex-col gap-1 p-4">
              <h4 className="font-medium leading-none mb-4">Notifications</h4>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "text-left p-3 rounded-lg transition-colors",
                      notification.read
                        ? "bg-muted/50 hover:bg-muted"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Goal Detected</AlertDialogTitle>
            <AlertDialogDescription>
              You have created a goal that appears to be a duplicate. Would you like to delete the new goal to avoid redundancy?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDuplicateDialog(false)}>Keep Both</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDuplicate}>Delete Duplicate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}