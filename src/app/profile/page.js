"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, logoutUser } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">Profile</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
          <div className="text-lg text-gray-900 dark:text-gray-100">{user.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}