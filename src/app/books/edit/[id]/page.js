"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { auth, fetchBook } from "../../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import BookForm from "@/components/BookForm";

export default function EditBookPage({ params }) {
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const resolvedParams = use(params);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const bookData = await fetchBook(resolvedParams.id);
        if (!bookData) {
          setError("Book not found");
          setTimeout(() => router.push("/books"), 2000);
          return;
        }
        setBook(bookData);
      } catch (error) {
        console.error("Error fetching book:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [resolvedParams.id, router]);

  if (isLoading) {
    return <div className="text-center p-4">Loading book...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Redirecting to books page...
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">
        Edit Book: {book.title}
      </h1>
      <BookForm selectedBook={book} isEditing={true} existingBook={book} />
    </div>
  );
}