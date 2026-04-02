"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";

function ProfilePage() {
  const { profile, instruments, isLoading, isSaving, error, updateProfile } = useProfile();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (data: Parameters<typeof updateProfile>[0]) => {
    setSaveSuccess(false);
    const ok = await updateProfile(data);
    if (ok) setSaveSuccess(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !profile) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>

      {saveSuccess && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-4 py-2">
          保存しました
        </p>
      )}

      {profile && (
        <ProfileEditForm
          profile={profile}
          instruments={instruments}
          isSaving={isSaving}
          saveError={error}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}
