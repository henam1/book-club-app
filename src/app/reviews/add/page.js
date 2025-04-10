"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import BookSearch from "@/components/BookSearch";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";

export default function AddReviewPage() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/auth");
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8 dark:text-gray-100">Add New Review</h1>
      {!selectedBook ? (
        <div className="w-full">
          <BookSearch onSelectBook={setSelectedBook} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            {selectedBook.thumbnail && (
              <img
                src={selectedBook.thumbnail}
                alt={selectedBook.title}
                className="w-32 h-48 object-cover rounded-md shadow-sm"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">{selectedBook.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">{selectedBook.authors}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Published: {selectedBook.publishedDate || 'N/A'}
              </p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setSelectedBook(null)}
              >
                ← Change Book
              </Button>
            </div>
          </div>
          <div className="mt-8">
            <ReviewForm selectedBook={selectedBook} />
          </div>
        </div>
      )}
    </div>
  );
}