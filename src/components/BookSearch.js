"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function BookSearch({ onSelectBook }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
                className="w-full"
            />
            {isLoading && <div className="text-center text-gray-500">Searching...</div>}
            {results.length > 0 && (
                <div className="space-y-2">
                    {results.map((book) => (
                        <Card
                            key={book.id}
                            className="p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => onSelectBook(book)}
                        >
                            <div className="flex gap-4">
                                {book.thumbnail && (
                                    <img
                                        src={book.thumbnail}
                                        alt={book.title}
                                        className="w-16 h-24 object-cover"
                                    />
                                )}
                                <div>
                                    <h3 className="font-semibold">{book.title}</h3>
                                    <p className="text-sm text-gray-600">{book.authors}</p>
                                    <p className="text-sm text-gray-500">{book.publishedDate}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}