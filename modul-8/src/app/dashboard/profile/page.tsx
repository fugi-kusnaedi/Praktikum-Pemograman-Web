import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const instant = false;

type SessionData = {
  id: number;
  name: string;
  nim: string | null;
  email: string;
  role: string;
  loginAt: string;
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("praktikum_session");
  if (!sessionCookie) redirect("/login");

  const userData: SessionData = JSON.parse(sessionCookie.value);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
          PROFIL TERPROTEKSI
        </span>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Profil Mahasiswa</h1>
        <p className="text-sm text-slate-500 mb-6">Data dibaca dari cookie sesi <code>praktikum_session</code>.</p>

        <div className="space-y-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-5 border border-slate-200">
          <p><strong>Nama Lengkap:</strong> {userData.name}</p>
          <p><strong>NIM:</strong> {userData.nim || "-"}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Hak Akses:</strong> {userData.role}</p>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline">&larr; Kembali ke Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
