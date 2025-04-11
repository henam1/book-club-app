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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Add new handler for clearing ratings
  const handleClearRating = (criterion) => {
    if (ratingType === 'simple') {
      setSimpleRating(0);
    } else {
      setRatings({ ...ratings, [criterion]: 0 });
    }
  };

  const calculateOverallRating = () => {
    // Get all criteria that should be rated
    const totalCriteria = criteriaList.length;
    
    // Sum all existing ratings (including 0s)
    const sum = criteriaList.reduce((acc, criterion) => {
      return acc + (ratings[criterion] || 0);
    }, 0);
  
    // Divide by total number of criteria
    return sum / totalCriteria;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const reviewData = {
        ...selectedBook,
        overall: ratingType === 'simple' ? simpleRating : calculateOverallRating(),
        ratings: ratingType === 'detailed' ? ratings : null,
        review: reviewText,
        ratingType
      };

      if (isEditing) {
        await updateReview(selectedBook.id, reviewData);
      } else {
        await saveBookReview(reviewData);
      }

      router.push('/reviews');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardContent className="p-8">
        <div className="space-y-8">
          <Tabs defaultValue="simple" value={ratingType} onValueChange={setRatingType}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto dark:bg-gray-700">
              <TabsTrigger value="simple" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                Simple Rating
              </TabsTrigger>
              <TabsTrigger value="detailed" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                Detailed Rating
              </TabsTrigger>
            </TabsList>
            
            {/* Simple Rating section */}
            <TabsContent value="simple" className="pt-8">
              <div className="flex flex-col items-center space-y-4">
                <h4 className="text-2xl font-medium dark:text-gray-200">Overall Rating</h4>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <StarRating
                    rating={simpleRating || 0}
                    onChange={handleSimpleRating}
                    size="text-4xl sm:text-5xl"
                    ariaLabel="Overall rating"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearRating('simple')}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 px-2"
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {simpleRating || 0} out of 5 stars
                </p>
              </div>
            </TabsContent>

            {/* Detailed Rating section */}
            <TabsContent value="detailed" className="pt-8">
              <div className="space-y-6 max-w-xl mx-auto">
                <h4 className="text-2xl font-medium dark:text-gray-200 mb-6 text-center">Rate Different Aspects</h4>
                {criteriaList.map((criterion) => (
                  <div key={criterion} className="flex flex-col items-center gap-3">
                    <label className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {criterion}
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={ratings[criterion] || 0}
                          onChange={(value) => handleDetailedRating(criterion, value)}
                          size="text-3xl sm:text-4xl"
                          ariaLabel={`Rate ${criterion}`}
                        />
                        <span className="text-sm sm:text-lg text-gray-500 dark:text-gray-400 min-w-[3rem]">
                          {ratings[criterion] || 0}/5
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearRating(criterion)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 px-2"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-8">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Your Review
            </label>
            <Textarea
              placeholder="Write your thoughts about the book..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              className="w-full text-base dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full max-w-md mx-auto block bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white mt-8 py-2.5"
            disabled={isSubmitting}
          >
            {isEditing ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}