"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Add this import
import { auth } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import BookSearch from "@/components/BookSearch";
import ReviewForm from "@/components/BookForm";
import { Button } from "@/components/ui/button";

export default function AddBookPage() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/auth");
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-8 dark:text-gray-100">Add New Book</h1>
      {!selectedBook ? (
        <div className="w-full">
          <BookSearch onSelectBook={setSelectedBook} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-8 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-none">
            {selectedBook.thumbnail && (
              <div className="flex-shrink-0 relative w-32 h-48">
                <Image
                  src={selectedBook.thumbnail}
                  alt={selectedBook.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 128px"
                  className="object-cover rounded-md border border-gray-200 dark:border-gray-700"
                  priority
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold mb-2 dark:text-gray-100 break-words">
                {selectedBook.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                {selectedBook.authors}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Published: {selectedBook.publishedDate || 'N/A'}
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                <p className={`${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                  {selectedBook.description || 'No description available'}
                </p>
                {selectedBook.description && selectedBook.description !== 'No description available' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-auto p-0 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border border-gray-200 dark:border-gray-700 shadow-none dark:text-gray-200 dark:hover:bg-gray-700"
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