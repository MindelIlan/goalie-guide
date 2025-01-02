import { Profile } from "@/components/Profile";

interface ProfileContainerProps {
  userId: string;
}

export const ProfileContainer = ({ userId }: ProfileContainerProps) => {
  return (
    <div className="bg-gradient-to-r from-[#accbee] to-[#e7f0fd] dark:from-[#2a3f54] dark:to-[#517fa4] rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
      <Profile userId={userId} />
    </div>
  );
};