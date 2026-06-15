import { TrainerProfileForm } from "@/components/trainer-profile-form";
import { getAppData } from "@/lib/data";

export default async function ProfilePage() {
  const data = await getAppData();
  return <TrainerProfileForm initialTrainer={data.trainer} />;
}
