"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function BookSearch({ onSelectBook }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchBooks = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=en&maxResults=20&printType=books`
                );
                const data = await res.json();
                if (data.items) {
                    const books = data.items
                        .filter(item => item.volumeInfo.language === 'en')
                        .map(item => {
                            const year = item.volumeInfo.publishedDate 
                                ? item.volumeInfo.publishedDate.split('-')[0]
                                : 'N/A';
                            
                            return {
                                id: item.id,
                                title: item.volumeInfo.title,
                                authors: item.volumeInfo.authors?.join(", ") || "Unknown",
                                publishedDate: item.volumeInfo.publishedDate || "N/A",
                                year: year,
                                thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
                                description: item.volumeInfo.description || 'No description available' // Added description
                            };
                        });
                    setResults(books);
                }
            } catch (error) {
                console.error("Error searching books:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchBooks, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const toggleDescription = (e, bookId) => {
        e.stopPropagation(); // Prevent triggering the card click
        setExpandedDescriptions(prev => ({
            ...prev,
            [bookId]: !prev[bookId]
        }));
    };

    return (
        <div className="space-y-4">
            <Input
                type="text"
                placeholder="Search for a book..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-200"
            />
            {isLoading && <div className="text-center text-gray-500 dark:text-gray-400">Searching...</div>}
            {results.length > 0 && (
                <div className="space-y-2">
                    {results.map((book) => (
                        <Card
                            key={book.id}
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                            onClick={() => onSelectBook(book)}
                        >
                            <div className="flex gap-4">
                                {book.thumbnail && (
                                    <div className="flex-shrink-0 w-24 h-32 relative">
                                        <Image
                                            src={book.thumbnail}
                                            alt={`Cover of ${book.title}`}
                                            fill
                                            className="object-cover rounded"
                                            sizes="(max-width: 96px) 100vw, 96px"
                                            priority={false}
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold dark:text-gray-200">{book.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{book.authors}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">{book.year}</p>
                                    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${
                                        expandedDescriptions[book.id] ? '' : 'line-clamp-2'
                                    }`}>
                                        {book.description}
                                    </p>
                                    {book.description && book.description !== 'No description available' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-1 h-auto p-0 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                            onClick={(e) => toggleDescription(e, book.id)}
                                        >
                                            {expandedDescriptions[book.id] ? 'Show Less' : 'Show More'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}