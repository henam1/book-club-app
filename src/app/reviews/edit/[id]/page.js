"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchReview } from "../../../../../firebase";
import ReviewForm from "@/components/ReviewForm";
import { use } from "react";

export default function EditReviewPage({ params }) {
  const id = use(params).id; // Properly unwrap the params
  const router = useRouter();
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const reviewData = await fetchReview(id); // Use unwrapped id
        if (!reviewData) {
          router.push("/reviews");
          return;
        }
        setReview(reviewData);
      } catch (error) {
        console.error("Failed to fetch review:", error);
        router.push("/reviews");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, router]); // Update dependency array with unwrapped id

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (!review) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Edit Review</h1>
      <div className="flex items-start gap-4 mb-6">
        {review.thumbnail && (
          <img
            src={review.thumbnail}
            alt={review.title}
            className="w-24 h-36 object-cover rounded-md shadow-sm"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold">{review.title}</h2>
          <p className="text-gray-600">{review.authors}</p>
          <p className="text-sm text-gray-500">
            Published: {review.publishedDate || 'N/A'}
          </p>
        </div>
      </div>
      <ReviewForm 
        selectedBook={review} 
        isEditing={true}
        existingReview={review}
      />
    </div>
  );
}