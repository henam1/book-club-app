"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, deleteReview } from "../../../firebase";
import { fetchUserReviews } from "../../../firebase";
import StarRating from "@/components/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";

export default function ReviewsPage() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      const loadReviews = async () => {
        try {
          const reviews = await fetchUserReviews();
          setBooks(reviews);
        } catch (error) {
          console.error("Failed to load reviews:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadReviews();
    });

    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth");
        return;
      }
      
      await deleteReview(reviewId);
      setBooks(prevBooks => prevBooks.filter(book => book.id !== reviewId));
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (reviewId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth");
        return;
      }
      router.push(`/reviews/edit/${reviewId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      alert("Failed to navigate to edit page");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold dark:text-gray-100">Your Reviews</h1>
        <Link 
          href="/reviews/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
        >
          Add Review
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You haven&apos;t added any reviews yet.</p>
          <Link 
            href="/reviews/add"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span className="mr-2">Click here to add your first review</span>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Card key={book.id} className="dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {book.thumbnail && (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="w-24 h-36 object-cover rounded-md shadow-sm"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold dark:text-gray-100">{book.title}</h2>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:text-gray-200 dark:hover:bg-gray-700"
                          onClick={() => handleEdit(book.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {book.authors && <div><strong className="dark:text-gray-200">Author:</strong> {book.authors}</div>}
                      {book.publishedDate && <div><strong className="dark:text-gray-200">Published:</strong> {book.publishedDate}</div>}
                    </div>
                    <div className="flex items-center space-x-2 dark:text-gray-200">
                      <span>Overall Rating:</span>
                      <StarRating rating={book.overall || 0} onChange={() => {}} size="text-xl" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {(book.overall || 0).toFixed(2)}
                      </span>
                    </div>
                    {book.review && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Review:</div>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{book.review}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}