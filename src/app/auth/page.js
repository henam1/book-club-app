"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, loginUser, registerUser } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lastAttempt, setLastAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) router.push("/profile");
    });

    return () => unsubscribe();
  }, [router]);

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters";
    if (!hasUpperCase) return "Password must contain an uppercase letter";
    if (!hasLowerCase) return "Password must contain a lowercase letter";
    if (!hasNumbers) return "Password must contain a number";
    if (!hasSpecialChar) return "Password must contain a special character";
    return "";
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Rate limiting
  const checkRateLimit = () => {
    const now = Date.now();
    if (attempts >= 5 && now - lastAttempt < 15 * 60 * 1000) {
      return "Too many attempts. Please try again in 15 minutes.";
    }
    return "";
  };

  const handleLogin = async () => {
    try {
      setError("");
      
      // Validate inputs
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }

      // Check rate limiting
      const rateLimitError = checkRateLimit();
      if (rateLimitError) {
        setError(rateLimitError);
        return;
      }

      setIsLoading(true);
      setAttempts(prev => prev + 1);
      setLastAttempt(Date.now());

      await loginUser(email, password);
      router.push("/reviews");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login");
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setError("");

      // Validate inputs
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      setIsLoading(true);
      await registerUser(email, password);
      router.push("/reviews");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container border p-4 rounded-md shadow-md bg-white dark:bg-gray-800 max-w-sm mx-auto mb-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-center dark:text-gray-200">
          Register or Login
        </h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          />
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Register"}
          </button>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}