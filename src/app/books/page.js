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
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10; // Adjust this value as needed
  const [isScrollable, setIsScrollable] = useState(false);
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

  useEffect(() => {
    const checkIfScrollable = () => {
      const tabsList = document.querySelector('.tabs-scroll-container');
      if (tabsList) {
        setIsScrollable(tabsList.scrollWidth > tabsList.clientWidth);
      }
    };

    checkIfScrollable();
    window.addEventListener('resize', checkIfScrollable);
    return () => window.removeEventListener('resize', checkIfScrollable);
  }, []);

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

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold dark:text-gray-100">My Books</h1>
        <Link 
          href="/books/add"
          className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition text-center border-0"
        >
          Add Book
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4 tabs-scroll-container">
            <TabsList className="inline-flex w-max min-w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger 
                value="all" 
                className="px-6 py-2 whitespace-nowrap text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
              >
                All Books
              </TabsTrigger>
              <TabsTrigger 
                value={BOOK_STATUSES.WANT_TO_READ}
                className="px-6 py-2 whitespace-nowrap text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
              >
                Want to Read
              </TabsTrigger>
              <TabsTrigger 
                value={BOOK_STATUSES.READING}
                className="px-6 py-2 whitespace-nowrap text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
              >
                Currently Reading
              </TabsTrigger>
              <TabsTrigger 
                value={BOOK_STATUSES.FINISHED}
                className="px-6 py-2 whitespace-nowrap text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
              >
                Finished
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="space-y-4">
          {currentBooks.map((book) => (
            <Card 
              key={book.id} 
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 bg-white shadow-none"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {book.thumbnail && (
                    <div className="relative w-24 h-36 mx-auto sm:mx-0">
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        sizes="(max-width: 768px) 96px, 96px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="w-full sm:w-auto">
                        <h2 className="text-xl font-semibold dark:text-gray-100 text-center sm:text-left">{book.title}</h2>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 text-center sm:text-left">
                          {book.authors && <div><strong className="dark:text-gray-200">Author:</strong> {book.authors}</div>}
                          {book.publishedDate && <div><strong className="dark:text-gray-200">Published:</strong> {book.publishedDate}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <select
                          value={book.status}
                          onChange={(e) => handleStatusChange(book.id, e.target.value)}
                          className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                        >
                          <option value={BOOK_STATUSES.WANT_TO_READ}>Want to Read</option>
                          <option value={BOOK_STATUSES.READING}>Currently Reading</option>
                          <option value={BOOK_STATUSES.FINISHED}>Finished</option>
                        </select>
                        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-none"
                            onClick={() => handleEdit(book.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-none"
                            onClick={() => handleDelete(book.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 dark:text-gray-200 mt-4">
                      <span>Overall Rating:</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={getOverallRating(book)} onChange={() => {}} size="text-xl" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {getOverallRating(book).toFixed(2)}
                        </span>
                        {getDetailedRatings(book) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookExpand(book.id)}
                            className="p-1 h-auto"
                          >
                            {expandedBooks[book.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {expandedBooks[book.id] && getDetailedRatings(book) && (
                      <div className="mt-4 flex justify-center">
                        <div className="max-w-2xl w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              {['Story', 'Characters', 'Language'].map((category) => (
                                <div key={category} className="flex items-center justify-between gap-4">
                                  <span className="capitalize text-sm text-gray-600 dark:text-gray-300">
                                    {category}:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <StarRating 
                                      rating={Number(book.review?.ratings?.[category]) || 0} 
                                      onChange={() => {}} 
                                      size="text-sm" 
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[32px]">
                                      {(Number(book.review?.ratings?.[category]) || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-3">
                              {['Pacing', 'Originality'].map((category) => (
                                <div key={category} className="flex items-center justify-between gap-4">
                                  <span className="capitalize text-sm text-gray-600 dark:text-gray-300">
                                    {category}:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <StarRating 
                                      rating={Number(book.review?.ratings?.[category]) || 0} 
                                      onChange={() => {}} 
                                      size="text-sm" 
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[32px]">
                                      {(Number(book.review?.ratings?.[category]) || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
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

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[40px] shadow-none border ${
                  pageNum === currentPage 
                    ? 'bg-blue-500 text-white border-0' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {pageNum}
              </Button>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
}