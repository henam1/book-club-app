"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarRating from "./StarRating";
import { saveBookReview, updateReview } from "../../firebase";

const criteriaList = ["Story", "Language", "Characters", "Pacing", "Originality"];

export default function ReviewForm({ selectedBook, isEditing = false, existingReview = null }) {
  const router = useRouter();
  const [ratings, setRatings] = useState({});
  const [simpleRating, setSimpleRating] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [ratingType, setRatingType] = useState("simple"); // "simple" or "detailed"

  // Load existing review data if editing
  useEffect(() => {
    if (isEditing && existingReview) {
      setRatings(existingReview.ratings || {});
      setSimpleRating(existingReview.simpleRating || null);
      setReviewText(existingReview.review || "");
    }
  }, [isEditing, existingReview]);

  const handleDetailedRating = (criterion, value) => {
    setRatings({ ...ratings, [criterion]: value });
    setSimpleRating(null);
    setRatingType("detailed");
  };

  const handleSimpleRating = (value) => {
    setSimpleRating(value);
    setRatings({});
    setRatingType("simple");
  };

  const handleSubmit = async () => {
    if (!selectedBook) {
      alert("Please select a book first");
      return;
    }

    if (simpleRating === null && Object.keys(ratings).length === 0) {
      alert("Please provide at least one rating");
      return;
    }

    let overall;
    if (simpleRating !== null) {
      overall = simpleRating;
    } else {
      const values = Object.values(ratings);
      overall = values.reduce((a, b) => a + b, 0) / values.length;
    }

    const reviewData = {
      ...selectedBook,
      ratings,
      simpleRating,
      review: reviewText,
      overall: parseFloat(overall.toFixed(2)),
      updatedAt: new Date().toISOString()
    };

    try {
      if (isEditing) {
        await updateReview(selectedBook.id, reviewData);
      } else {
        await saveBookReview(reviewData);
      }
      router.push("/reviews");
    } catch (error) {
      alert(`Failed to ${isEditing ? 'update' : 'save'} review: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <Tabs defaultValue="simple" value={ratingType} onValueChange={setRatingType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Simple Rating</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Rating</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="pt-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-medium mb-4">Overall Rating</h4>
                  <StarRating
                    rating={simpleRating || 0}
                    onChange={handleSimpleRating}
                    size="text-3xl"
                    ariaLabel="Overall rating"
                  />
                  {simpleRating && (
                    <p className="text-sm text-gray-600 mt-2">
                      {simpleRating} out of 5 stars
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="pt-4">
              <div className="space-y-4">
                <h4 className="text-lg font-medium mb-4">Rate Different Aspects</h4>
                {criteriaList.map((criterion) => (
                  <div key={criterion} className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 w-24">
                      {criterion}
                    </label>
                    <div className="flex-1">
                      <StarRating
                        rating={ratings[criterion] || 0}
                        onChange={(value) => handleDetailedRating(criterion, value)}
                        size="text-xl"
                        ariaLabel={`Rate ${criterion}`}
                      />
                    </div>
                    {ratings[criterion] && (
                      <span className="text-sm text-gray-500 w-16 text-right">
                        {ratings[criterion]}/5
                      </span>
                    )}
                  </div>
                ))}
                {Object.keys(ratings).length > 0 && (
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Average: {(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length).toFixed(1)} out of 5
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <Textarea
              placeholder="Write your thoughts about the book..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white mt-4"
          >
            {isEditing ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}