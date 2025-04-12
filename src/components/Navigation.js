"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

export default function Navigation() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex h-16">
          {/* Left section - Brand/Home */}
          <div className="flex items-center flex-1">
            <Link 
              href="/"
              className="inline-flex items-center px-1 pt-1"
            >
              <Image
                src="/images/logo.png"
                alt="BookClub Logo"
                width={120}
                height={32}
                className="dark:invert"
                priority
              />
            </Link>
          </div>

          {/* Center section - Main navigation */}
          <div className="flex items-center justify-center flex-1">
            {isLoggedIn && (
              <div className="flex space-x-8">
                <Link 
                  href="/books"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname.startsWith("/books") ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  My Books
                </Link>
              </div>
            )}
          </div>

          {/* Right section - Auth/Profile */}
          <div className="flex items-center justify-end flex-1">
            {!isLoggedIn ? (
              <Link 
                href="/auth"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${pathname === "/auth" 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                Sign In
              </Link>
            ) : (
              <Link 
                href="/account"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${pathname === "/account" 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}