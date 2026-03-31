import Link from "next/link";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const isAccessDenied = error === "AccessDenied";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-sm space-y-6 text-center">
        <div className="text-4xl">{isAccessDenied ? "🚫" : "⚠️"}</div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            {isAccessDenied ? "アクセスが許可されていません" : "ログインエラー"}
          </h1>
          <p className="text-sm text-gray-500">
            {isAccessDenied
              ? "このアプリはSlackワークスペースのメンバーのみ利用できます。アカウントが登録されているかご確認ください。"
              : "ログイン中にエラーが発生しました。もう一度お試しください。"}
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="block w-full bg-blue-600 text-white py-2 rounded font-medium text-sm hover:bg-blue-700"
        >
          ログインページに戻る
        </Link>
      </div>
    </div>
  );
}
