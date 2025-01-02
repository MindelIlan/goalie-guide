import { supabase } from "@/lib/supabase";

export const createWelcomeNotification = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        type: 'welcome',
        title: 'Welcome to Goal Tracker!',
        message: 'You can share your goals with friends! Click on any goal card and use the share button to invite others to view and track your progress.',
        read: false
      }
    ]);

  if (error) {
    console.error('Error creating welcome notification:', error);
  }
};