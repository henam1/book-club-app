"use client";
import React, { useState } from "react";
import { registerUser, loginUser, logoutUser } from "../../firebase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      alert("Registration successful!");
      setIsLoggedIn(true);
    } catch (error) {
      alert("Error registering: " + error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      alert("Login successful!");
      setIsLoggedIn(true);
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      alert("Logout successful!");
      setIsLoggedIn(false);
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  return (
    <div className="auth-container border p-4 rounded-md shadow-md bg-white max-w-sm mx-auto mb-6">
      {!isLoggedIn ? (
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
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-center">Welcome!</h2>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}