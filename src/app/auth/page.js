"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, loginUser, registerUser, logoutUser } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) router.push("/profile");
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      router.push("/reviews");
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      router.push("/reviews");
    } catch (error) {
      alert("Error registering: " + error.message);
    }
  };

  return (
    <div className="auth-container border p-4 rounded-md shadow-md bg-white max-w-sm mx-auto mb-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-center">Register or Login</h2>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Register
          </button>
          <button
            onClick={handleLogin}
            className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}