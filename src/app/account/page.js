"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, updateUserEmail, updateUserPassword, deleteUserAccount, logoutUser, reauthenticateUser } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { validatePassword } from "@/utils/validation";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { useTheme } from "@/components/ThemeProvider";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { theme, setTheme } = useTheme();

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

  const handleReauthenticate = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await reauthenticateUser(currentPassword);
      setIsReauthenticating(false);
      
      // Execute pending action after successful reauthentication
      if (pendingAction?.type === 'email') {
        await handleUpdateEmail(null, pendingAction.data);
      } else if (pendingAction?.type === 'password') {
        await handleUpdatePassword(null, pendingAction.data);
      } else if (pendingAction?.type === 'delete') {
        await handleDeleteAccount(true);
      }
      
      setPendingAction(null);
      setCurrentPassword("");
    } catch (error) {
      setError("Invalid password. Please try again.");
    }
  };

  const handleUpdateEmail = async (e, emailToUpdate = null) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    
    const emailToUse = emailToUpdate || newEmail;
    
    try {
      await updateUserEmail(emailToUse);
      setSuccess("Email updated successfully!");
      setIsEditingEmail(false);
      setNewEmail("");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setPendingAction({ type: 'email', data: emailToUse });
        setIsReauthenticating(true);
      } else {
        setError(error.message);
      }
    }
  };

  const handleUpdatePassword = async (e, passwordToUpdate = null) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    
    const passwordToUse = passwordToUpdate || newPassword;
    
    const validation = validatePassword(passwordToUse);
    if (!validation.isValid) {
      setError("Password doesn't meet the requirements");
      return;
    }
    
    try {
      await updateUserPassword(passwordToUse);
      setSuccess("Password updated successfully!");
      setIsEditingPassword(false);
      setNewPassword("");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setPendingAction({ type: 'password', data: passwordToUse });
        setIsReauthenticating(true);
      } else {
        setError(error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async (isReauthenticated = false) => {
    try {
      await deleteUserAccount();
      router.push("/");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setPendingAction({ type: 'delete' });
        setIsReauthenticating(true);
      } else {
        setError(error.message);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">Account Settings</h1>
      
      <div className="space-y-6">
        {/* Main Settings Section */}
        <div className="space-y-6">
          {/* Email and Password Card */}
          <Card className="p-6 border-gray-200 dark:border-gray-700">
            {/* Email Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium dark:text-gray-100">Email Address</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEditingEmail ? "Enter your new email address" : user.email}
                  </p>
                </div>
                {!isEditingEmail && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingEmail(true)}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Change
                  </Button>
                )}
              </div>
              {isEditingEmail && (
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingEmail(false)}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Email
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Password Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium dark:text-gray-100">Password</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEditingPassword ? "Enter your new password" : "••••••••"}
                  </p>
                </div>
                {!isEditingPassword && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPassword(true)}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Change
                  </Button>
                )}
              </div>
              {isEditingPassword && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full"
                      minLength={8}
                      required
                    />
                    <PasswordRequirements />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingPassword(false)}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Password
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>

          {/* Reauthentication Section */}
          {isReauthenticating && (
            <Card className="p-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <h2 className="text-lg font-medium text-yellow-800 dark:text-yellow-400 mb-4">
                Please Verify Your Identity
              </h2>
              <p className="text-sm text-yellow-800/70 dark:text-yellow-400/70 mb-4">
                For security reasons, please enter your current password to continue.
              </p>
              <form onSubmit={handleReauthenticate} className="space-y-4">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full"
                  required
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsReauthenticating(false);
                      setPendingAction(null);
                      setCurrentPassword("");
                    }}
                    className="border-yellow-200 dark:border-yellow-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Verify
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {/* Appearance Section */}
          <Card className="p-6 border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h2 className="text-lg font-medium dark:text-gray-100">Appearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred theme
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setTheme('light')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                  theme === 'light' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🌞</span>
                  <span>Light</span>
                </div>
                {theme === 'light' && <span>✓</span>}
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🌙</span>
                  <span>Dark</span>
                </div>
                {theme === 'dark' && <span>✓</span>}
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                  theme === 'system' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>💻</span>
                  <span>System</span>
                </div>
                {theme === 'system' && <span>✓</span>}
              </button>
            </div>
          </Card>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-gray-200 dark:border-gray-700"
          >
            Log Out
          </Button>
        </div>

        {/* Danger Zone Section - Separated */}
        <div className="pt-12 mt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Advanced Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              These actions are permanent and cannot be undone
            </p>
          </div>
          
          <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </div>
    </div>
  );
}