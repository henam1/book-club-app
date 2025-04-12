"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarRating from "./StarRating";
import { saveBook, updateBook } from "../../firebase";

const criteriaList = ["Story", "Language", "Characters", "Pacing", "Originality"];
const BOOK_STATUSES = {
  WANT_TO_READ: 'want-to-read',
  READING: 'reading',
  FINISHED: 'finished'
};

export default function BookForm({ selectedBook, isEditing = false, existingBook = null }) {
  const router = useRouter();
  const [ratings, setRatings] = useState({});
  const [simpleRating, setSimpleRating] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [ratingType, setRatingType] = useState("simple");
  const [status, setStatus] = useState(BOOK_STATUSES.WANT_TO_READ);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && existingBook) {
      setRatings(existingBook.ratings || {});
      setSimpleRating(existingBook.simpleRating || null);
      setReviewText(existingBook.review?.text || "");
      setStatus(existingBook.status || BOOK_STATUSES.WANT_TO_READ);
    }
  }, [isEditing, existingBook]);

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

  const handleClearRating = (criterion) => {
    if (ratingType === 'simple') {
      setSimpleRating(0);
    } else {
      setRatings({ ...ratings, [criterion]: 0 });
    }
  };

  const calculateOverallRating = () => {
    const totalCriteria = criteriaList.length;
    const sum = criteriaList.reduce((acc, criterion) => {
      return acc + (ratings[criterion] || 0);
    }, 0);
    return sum / totalCriteria;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const bookData = {
        ...selectedBook,
        status,
        ratings: ratingType === 'detailed' ? ratings : null,
        review: {
          text: reviewText,
          ratingType,
          simpleRating: ratingType === 'simple' ? simpleRating : null,
          ratings: ratingType === 'detailed' ? ratings : null,
          overall: ratingType === 'simple' ? simpleRating : calculateOverallRating()
        }
      };

      if (isEditing) {
        await updateBook(selectedBook.id, bookData);
      } else {
        await saveBook(bookData);
      }

      router.push('/books');
    } catch (error) {
      console.error('Error submitting:', error);
      alert(error.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardContent className="p-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium dark:text-gray-200">Reading Status</h4>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BOOK_STATUSES.WANT_TO_READ}>Want to Read</SelectItem>
                <SelectItem value={BOOK_STATUSES.READING}>Currently Reading</SelectItem>
                <SelectItem value={BOOK_STATUSES.FINISHED}>Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="simple" value={ratingType} onValueChange={setRatingType}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto dark:bg-gray-700">
              <TabsTrigger value="simple" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                Simple Rating
              </TabsTrigger>
              <TabsTrigger value="detailed" className="dark:text-gray-200 dark.data-[state=active]:bg-gray-800">
                Detailed Rating
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="pt-8">
              <div className="flex flex-col items-center space-y-4">
                <h4 className="text-2xl font-medium dark:text-gray-200">Overall Rating</h4>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <StarRating
                    rating={simpleRating || 0}
                    onChange={handleSimpleRating}
                    size="text-5xl sm:text-6xl"
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
                          size="text-4xl sm:text-5xl"
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
            {isEditing ? 'Update Book' : 'Add Book'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}