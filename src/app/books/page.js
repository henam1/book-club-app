"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { auth, fetchUserBooks, updateBook, deleteBook } from "../../../firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { onAuthStateChanged } from "firebase/auth";
import { ChevronDown, ChevronUp } from 'lucide-react';
import StarRating from "@/components/StarRating";

// Update the status constants
const BOOK_STATUSES = {
  WANT_TO_READ: 'want-to-read',
  READING: 'reading',
  FINISHED: 'finished'
};

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedBooks, setExpandedBooks] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      loadBooks();
    });

    return () => unsubscribe();
  }, [router]);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const userBooks = await fetchUserBooks();
      setBooks(userBooks);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      await updateBook(bookId, { status: newStatus });
      await loadBooks();
    } catch (error) {
      console.error("Error updating book status:", error);
    }
  };

  const handleEdit = (bookId) => {
    router.push(`/books/edit/${bookId}`);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteBook(bookId);
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete book");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookExpand = (bookId) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  const getOverallRating = (book) => {
    if (!book.review) return 0;
    if (book.review.ratingType === 'simple') {
      return book.review.simpleRating || 0;
    }
    return book.review.overall || 0;
  };

  const getDetailedRatings = (book) => {
    if (!book.review || book.review.ratingType !== 'detailed') return null;
    return book.review.ratings;
  };

  const filteredBooks = activeTab === "all" 
    ? books 
    : books.filter(book => book.status === activeTab);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold dark:text-gray-100">My Books</h1>
        <Link 
          href="/books/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
        >
          Add Book
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all">All Books</TabsTrigger>
          <TabsTrigger value={BOOK_STATUSES.WANT_TO_READ}>Want to Read</TabsTrigger>
          <TabsTrigger value={BOOK_STATUSES.READING}>Currently Reading</TabsTrigger>
          <TabsTrigger value={BOOK_STATUSES.FINISHED}>Finished</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {book.thumbnail && (
                    <div className="relative w-24 h-36">
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover rounded-md shadow-sm"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold dark:text-gray-100">{book.title}</h2>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {book.authors && <div><strong className="dark:text-gray-200">Author:</strong> {book.authors}</div>}
                          {book.publishedDate && <div><strong className="dark:text-gray-200">Published:</strong> {book.publishedDate}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={book.status}
                          onChange={(e) => handleStatusChange(book.id, e.target.value)}
                          className="bg-white dark:bg-gray-700 border rounded-md px-2 py-1 text-sm"
                        >
                          <option value={BOOK_STATUSES.WANT_TO_READ}>Want to Read</option>
                          <option value={BOOK_STATUSES.READING}>Currently Reading</option>
                          <option value={BOOK_STATUSES.FINISHED}>Finished</option>
                        </select>
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

                    <div className="flex items-center space-x-2 dark:text-gray-200 mt-2">
                      <span>Overall Rating:</span>
                      <StarRating rating={getOverallRating(book)} onChange={() => {}} size="text-xl" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {getOverallRating(book).toFixed(2)}
                      </span>
                      {getDetailedRatings(book) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookExpand(book.id)}
                          className="ml-2 p-1 h-auto"
                        >
                          {expandedBooks[book.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>

                    {expandedBooks[book.id] && getDetailedRatings(book) && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {['Story', 'Characters', 'Language'].map((category) => (
                              <div key={category} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="capitalize min-w-[100px]">{category}:</span>
                                <div className="flex items-center gap-2">
                                  <StarRating 
                                    rating={Number(book.review?.ratings?.[category]) || 0} 
                                    onChange={() => {}} 
                                    size="text-sm" 
                                  />
                                  <span className="ml-2 text-xs min-w-[32px]">
                                    {(Number(book.review?.ratings?.[category]) || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            {['Pacing', 'Originality'].map((category) => (
                              <div key={category} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="capitalize min-w-[100px]">{category}:</span>
                                <div className="flex items-center gap-2">
                                  <StarRating 
                                    rating={Number(book.review?.ratings?.[category]) || 0} 
                                    onChange={() => {}} 
                                    size="text-sm" 
                                  />
                                  <span className="ml-2 text-xs min-w-[32px]">
                                    {(Number(book.review?.ratings?.[category]) || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {book.review?.text && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Review:</div>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {book.review.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}