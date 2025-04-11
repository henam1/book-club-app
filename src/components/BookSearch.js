"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from 'next/image';

export default function BookSearch({ onSelectBook }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]); // Clear results if query is empty
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search books');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchBooks = async () => {
            setIsLoading(true);
            try {
                // Add maxResults and language filter
                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=en&maxResults=20&printType=books`
                );
                const data = await res.json();
                if (data.items) {
                    const books = data.items
                        .filter(item => 
                            // Additional check for English language
                            item.volumeInfo.language === 'en'
                        )
                        .map(item => {
                            // Extract year from publishedDate
                            const year = item.volumeInfo.publishedDate 
                                ? item.volumeInfo.publishedDate.split('-')[0]
                                : 'N/A';
                            
                            return {
                                id: item.id,
                                title: item.volumeInfo.title,
                                authors: item.volumeInfo.authors?.join(", ") || "Unknown",
                                publishedDate: item.volumeInfo.publishedDate || "N/A",
                                year: year, // Add year separately
                                thumbnail: item.volumeInfo.imageLinks?.thumbnail || null
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
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}