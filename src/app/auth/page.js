"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, loginUser, resetPassword } from "../../../firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePassword } from "@/utils/validation";
import { PasswordRequirements } from "@/components/PasswordRequirements";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!isLogin) {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setError("Password doesn't meet requirements");
        return;
      }
    }
    
    try {
      if (isResetPassword) {
        await resetPassword(email);
        setResetSent(true);
        return;
      }

      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
      router.push("/books");
    } catch (error) {
      setError(error.message);
    }
  };

  if (isResetPassword) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">Reset Password</h1>
        {resetSent ? (
          <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-green-800 dark:text-green-400">
              Password reset email sent! Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsResetPassword(false)}
              >
                Back to Login
              </Button>
              <Button type="submit" className="flex-1">
                Send Reset Email
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">
        {isLogin ? "Login" : "Create Account"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
            minLength={8}
          />
          {!isLogin && <PasswordRequirements />}
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <Button type="submit" className="w-full">
          {isLogin ? "Login" : "Create Account"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        {isLogin ? (
          <>
            <button
              type="button"
              onClick={() => setIsResetPassword(true)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Forgot password?
            </button>
            <div className="mt-2">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-500 hover:text-blue-600"
              >
                Sign up
              </button>
            </div>
          </>
        ) : (
          <div>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="text-blue-500 hover:text-blue-600"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}