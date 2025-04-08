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
    <div>
      <h1 className="text-2xl font-semibold mb-6">Add New Review</h1>
      {!selectedBook ? (
        <BookSearch onSelectBook={setSelectedBook} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4 mb-6">
            {selectedBook.thumbnail && (
              <img
                src={selectedBook.thumbnail}
                alt={selectedBook.title}
                className="w-24 h-36 object-cover rounded-md shadow-sm"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{selectedBook.title}</h2>
              <p className="text-gray-600">{selectedBook.authors}</p>
              <p className="text-sm text-gray-500">
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
          <ReviewForm selectedBook={selectedBook} />
        </div>
      )}
    </div>
  );
}