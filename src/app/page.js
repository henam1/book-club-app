"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { saveBookReview, fetchUserReviews } from "../../firebase";
import Auth from "./Auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";

const criteriaList = ["Story", "Language", "Characters", "Pacing", "Originality"];

const StarRating = ({ rating, onChange, size = "text-2xl", ariaLabel }) => {
  const handleClick = (e, star) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const isHalf = x < width / 2;
    const newRating = isHalf ? star - 0.5 : star;
    onChange(newRating);
  };

  return (
    <div className="flex space-x-1" aria-label={ariaLabel}>
      {[1, 2, 3, 4, 5].map((star) => {
        let icon;
        if (rating >= star) {
          icon = <FaStar className={`text-yellow-500 ${size}`} />;
        } else if (rating >= star - 0.5) {
          icon = <FaStarHalfAlt className={`text-yellow-500 ${size}`} />;
        } else {
          icon = <FaRegStar className={`text-yellow-500 ${size}`} />;
        }

        return (
          <span
            key={star}
            onClick={(e) => handleClick(e, star)}
            className="cursor-pointer"
          >
            {icon}
          </span>
        );
      })}
    </div>
  );
};

export default function BookClubApp() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookInfo, setBookInfo] = useState(null);
  const [bookResults, setBookResults] = useState([]);
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [simpleRating, setSimpleRating] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userReviews, setUserReviews] = useState([]);

  const handleLogout = () => {
    setUserReviews([]); // Clear user reviews on logout
    setBooks([]); // Clear books state on logout
  };

  useEffect(() => {
    const fetchBookData = async () => {
      if (!bookTitle.trim()) return;
      setIsLoading(true);
      setHasSearched(true);
      const query = encodeURIComponent(bookTitle);
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${query}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const results = data.items.map(item => {
            const volume = item.volumeInfo;
            return {
              title: volume.title,
              authors: volume.authors?.join(", ") || "Unknown",
              publishedDate: volume.publishedDate || "N/A",
              description: volume.description || "",
              thumbnail: volume.imageLinks?.thumbnail || null,
            };
          });
          setBookResults(results);
          setSelectedBookIndex(0);
          setBookInfo(results[0]);
        } else {
          setBookResults([]);
          setBookInfo(null);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchBookData, 500);
    return () => clearTimeout(delayDebounce);
  }, [bookTitle]);

  useEffect(() => {
    const loadReviews = async () => {
      const user = auth.currentUser; // Check if a user is logged in
      if (!user) return; // Exit if no user is logged in

      try {
        const reviews = await fetchUserReviews();
        setUserReviews(reviews);
        setBooks(reviews); // Sync books state with user reviews
      } catch (error) {
        console.error("Failed to load reviews:", error);
      }
    };

    loadReviews();
  }, []);

  const handleDetailedRating = (criterion, value) => {
    setRatings({ ...ratings, [criterion]: value });
  };

  const handleAddBook = async () => {
    if (!bookInfo) {
      alert("Please select a book before adding.");
      return;
    }
    if (simpleRating === null && Object.keys(ratings).length === 0) {
      alert("Please provide at least one rating or a review.");
      return;
    }

    let overall;
    if (simpleRating !== null) {
      overall = simpleRating;
    } else {
      const values = Object.values(ratings);
      overall = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    const review = {
      ...bookInfo,
      ratings,
      simpleRating,
      review: reviewText,
      overall: parseFloat(overall.toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveBookReview(review);
      setBooks([...books, review]);
      setBookTitle("");
      setRatings({});
      setSimpleRating(null);
      setReviewText("");
      setBookInfo(null);
      setBookResults([]);
      setHasSearched(false);
    } catch (error) {
      alert("Failed to save the review. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Auth onLogout={handleLogout} /> {/* Pass the handleLogout function */}
      <Card className="mb-4">
        <CardContent className="space-y-4">
          <Input
            placeholder="Book Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            aria-label="Search for a book by title"
          />
          {isLoading && <div className="text-center text-gray-500">Loading...</div>}
          {!isLoading && hasSearched && bookResults.length === 0 && (
            <div className="text-center text-gray-500">No results found for &quot;{bookTitle}&quot;.</div>
          )}
          {bookResults.length > 1 && (
            <div className="space-y-1 text-sm text-gray-600">
              {bookResults.slice(0, 3).map((book, idx) => (
                <div
                  key={idx}
                  onClick={() => { setSelectedBookIndex(idx); setBookInfo(book); }}
                  className={`cursor-pointer p-1 rounded ${selectedBookIndex === idx ? "bg-blue-100" : "hover:bg-gray-100"}`}
                >
                  {book.title} ({book.authors})
                </div>
              ))}
            </div>
          )}
          {bookInfo && (
            <div className="text-sm text-gray-600">
              <div className="flex items-start gap-3">
                {bookInfo.thumbnail && <img src={bookInfo.thumbnail} alt="cover" className="w-16 h-24 object-cover rounded" />}
                <div>
                  <div><strong>Author:</strong> {bookInfo.authors}</div>
                  <div><strong>Published:</strong> {bookInfo.publishedDate}</div>
                  <div className="mt-1 italic text-xs line-clamp-2">{bookInfo.description}</div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {criteriaList.map((criterion) => (
              <div key={criterion}>
                <Label>{criterion}</Label>
                <StarRating
                  rating={ratings[criterion] || 0}
                  onChange={(value) => handleDetailedRating(criterion, value)}
                  size="text-2xl"
                  ariaLabel={`Rate ${criterion}`}
                />
              </div>
            ))}
          </div>
          <Label>OR Simple Overall Rating</Label>
          <StarRating
            rating={simpleRating || 0}
            onChange={(value) => setSimpleRating(value)}
            size="text-2xl"
            ariaLabel="Overall rating"
          />
          <Textarea
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            aria-label="Write your review"
          />
          <Button onClick={handleAddBook}>Add Book</Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {books.map((book, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <div className="text-sm text-gray-600 mb-2">
                {book.authors && <div><strong>Author:</strong> {book.authors}</div>}
                {book.publishedDate && <div><strong>Published:</strong> {book.publishedDate}</div>}
              </div>
              <div className="flex items-center space-x-2">
                <span>Overall Rating:</span>
                <StarRating rating={book.overall} onChange={() => {}} size="text-xl" />
                <span className="text-sm text-gray-500 font-mono">{book.overall.toFixed(2)}</span>
              </div>
              {book.simpleRating === null && (
                <ul className="list-disc pl-5 mt-2">
                  {Object.entries(book.ratings).map(([key, val]) => (
                    <li key={key}>{key}: {val}</li>
                  ))}
                </ul>
              )}
              {book.review && (
                <div className="mt-4">
                  <Label className="block text-sm text-gray-600 mb-1">Review:</Label>
                  <p className="text-gray-800 whitespace-pre-wrap">{book.review}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        {auth.currentUser && userReviews.length > 0 && ( // Check if logged in and there are reviews
          <>
            <h1>Your Reviews</h1>
            <div>
              {userReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <h2>{review.title}</h2>
                  <p>{review.review}</p>
                  <p>Overall Rating: {review.overall}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}