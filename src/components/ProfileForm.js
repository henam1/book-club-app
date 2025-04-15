"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BookSearch from "@/components/BookSearch";
import imageCompression from 'browser-image-compression';
import { auth, uploadProfilePicture } from "../../firebase";

const readingPreferenceOptions = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Biography",
  "History",
  "Self-Help",
  "Business"
];

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const MAX_IMAGE_DIMENSION = 200; // 200px max width/height

const resizeImage = async (file) => {
  const options = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: MAX_IMAGE_DIMENSION,
    useWebWorker: true,
    fileType: 'image/jpeg' // Convert all images to JPEG for better compression
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error resizing image:", error);
    throw new Error("Failed to resize image");
  }
};

export default function ProfileForm({ initialProfile, onSubmit }) {
  const [profile, setProfile] = useState(initialProfile || {});
  const [isBookSearchOpen, setIsBookSearchOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG)');
      return;
    }

    setIsUploading(true);
    try {
      // Resize and compress image
      const resizedImage = await resizeImage(file);
      
      // Double-check size after compression
      if (resizedImage.size > MAX_FILE_SIZE) {
        throw new Error('Image still too large after compression. Please choose a smaller image.');
      }

      const photoURL = await uploadProfilePicture(auth.currentUser.uid, resizedImage);
      setProfile(prev => ({ ...prev, photoURL }));
    } catch (error) {
      console.error("Error handling photo:", error);
      alert(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreferenceToggle = (preference) => {
    const preferences = profile.readingPreferences || [];
    const updated = preferences.includes(preference)
      ? preferences.filter(p => p !== preference)
      : [...preferences, preference];
    setProfile(prev => ({ ...prev, readingPreferences: updated }));
  };

  const handleFavoriteBookSelect = (book) => {
    setProfile(prev => ({
      ...prev,
      favoriteBook: {
        id: book.id,
        title: book.title,
        authors: book.authors,
        thumbnail: book.thumbnail
      }
    }));
    setIsBookSearchOpen(false);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(profile);
    }} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                {profile.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt="Profile"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Change Photo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <Input
              value={profile.displayName || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <Textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full"
              rows={4}
            />
          </div>

          {/* Favorite Book */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Favorite Book
            </label>
            {profile.favoriteBook ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                {profile.favoriteBook.thumbnail && (
                  <div className="relative w-16 h-24">
                    <Image
                      src={profile.favoriteBook.thumbnail}
                      alt={profile.favoriteBook.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium dark:text-gray-200">{profile.favoriteBook.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.favoriteBook.authors}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBookSearchOpen(true)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookSearchOpen(true)}
              >
                Select Favorite Book
              </Button>
            )}
          </div>

          {/* Reading Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {readingPreferenceOptions.map(preference => (
                <Button
                  key={preference}
                  type="button"
                  variant={profile.readingPreferences?.includes(preference) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePreferenceToggle(preference)}
                >
                  {preference}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Book Search Dialog */}
      {isBookSearchOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-gray-100">Select Favorite Book</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBookSearchOpen(false)}
                >
                  Close
                </Button>
              </div>
              <BookSearch onSelectBook={handleFavoriteBookSelect} />
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">
          Save Profile
        </Button>
      </div>
    </form>
  );
}