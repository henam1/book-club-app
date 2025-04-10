"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, fetchReview } from "../../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReviewForm from "@/components/ReviewForm";

export default function EditReviewPage({ params }) {
  const router = useRouter();
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(params?.id);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("User not authenticated, redirecting...");
        router.push("/auth");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const reviewData = await fetchReview(id);
        setReview(reviewData);
      } catch (error) {
        console.error("Failed to fetch review:", error);
        setError(error.message);
        setTimeout(() => router.push("/reviews"), 2000);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  if (isLoading) {
    return <div className="text-center p-4">Loading review...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Redirecting to reviews page...
        </div>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">
        Edit Review: {review.title}
      </h1>
      <ReviewForm selectedBook={review} isEditing={true} existingReview={review} />
    </div>
  );
}