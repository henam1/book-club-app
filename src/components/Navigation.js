"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

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
    <nav className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link 
              href="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                pathname === "/" ? "border-blue-500" : "border-transparent"
              }`}
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/reviews"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname.startsWith("/reviews") ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  My Reviews
                </Link>
                <Link 
                  href="/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname === "/profile" ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  Profile
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center">
            {!isLoggedIn ? (
              <Link 
                href="/auth"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  pathname === "/auth" ? "border-blue-500" : "border-transparent"
                }`}
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}