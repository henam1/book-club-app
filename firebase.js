import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export const BOOK_STATUSES = {
  WANT_TO_READ: 'want-to-read',
  READING: 'reading',
  FINISHED: 'finished'
};

export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create initial profile
    await createUserProfile(user.uid, {
      displayName: '',
      bio: '',
      photoURL: null,
      favoriteBook: null,
      readingPreferences: []
    });

    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function saveBook(bookData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const book = {
      id: bookData.id || crypto.randomUUID(),
      userId: user.uid,
      title: bookData.title,
      authors: bookData.authors,
      publishedDate: bookData.publishedDate,
      thumbnail: bookData.thumbnail,
      status: bookData.status || BOOK_STATUSES.WANT_TO_READ,
      startDate: bookData.startDate || null,
      completedDate: bookData.completedDate || null,
      ratings: bookData.ratings || null,
      review: bookData.review || null,
      description: bookData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "books"), book);
    return docRef.id;
  } catch (error) {
    console.error("Error saving book:", error);
    throw error;
  }
}

export async function updateBook(bookId, updateData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const booksCollection = collection(db, "books");
    const q = query(
      booksCollection,
      where("id", "==", bookId),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Book not found");
    }

    const bookDoc = querySnapshot.docs[0];
    const currentData = bookDoc.data();

    if (updateData.status) {
      if (updateData.status === BOOK_STATUSES.READING && currentData.status !== BOOK_STATUSES.READING) {
        updateData.startDate = new Date().toISOString();
      } else if (updateData.status === BOOK_STATUSES.FINISHED) {
        updateData.completedDate = new Date().toISOString();
      }
    }

    if (updateData.review) {
      updateData.review = {
        text: updateData.review.text || "",
        ratingType: updateData.review.ratingType || "simple",
        simpleRating: updateData.review.simpleRating || null,
        ratings: updateData.review.ratings || null,
        overall: updateData.review.overall || null
      };
    }

    const finalUpdateData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, "books", bookDoc.id), finalUpdateData);
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
}

export async function deleteBook(bookId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const booksCollection = collection(db, "books");
    const q = query(
      booksCollection,
      where("id", "==", bookId),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Book not found");
    }

    const bookDoc = querySnapshot.docs[0];
    await deleteDoc(doc(db, "books", bookDoc.id));
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
}

export async function fetchUserBooks() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const q = query(
      collection(db, "books"),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const userBooks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return userBooks;
  } catch (error) {
    console.error("Error fetching user books:", error);
    throw error;
  }
}

export async function fetchBook(bookId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const booksCollection = collection(db, "books");
    const q = query(
      booksCollection,
      where("id", "==", bookId),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Book not found");
    }

    const bookDoc = querySnapshot.docs[0];
    return { id: bookDoc.id, ...bookDoc.data() };
  } catch (error) {
    console.error("Error fetching book:", error);
    throw error;
  }
}

export const updateUserEmail = async (newEmail) => {
  try {
    const user = auth.currentUser;
    await updateEmail(user, newEmail);
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
};

export const updateUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    
    // Delete all user's books
    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    // Delete each book document
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    // Delete profile picture from storage if it exists
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    try {
      await deleteObject(storageRef);
    } catch (error) {
      // Ignore if profile picture doesn't exist
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
    }
    
    // Delete user profile document
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    // Finally delete the user account
    await deleteUser(user);
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

export async function reauthenticateUser(password) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, password);
  
  try {
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error("Reauthentication error:", error);
    throw error;
  }
}

export async function createUserProfile(userId, profileData) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(userId, profileData) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function fetchUserProfile(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function uploadProfilePicture(userId, file) {
  try {
    // Size limit in bytes (500KB)
    const MAX_FILE_SIZE = 500 * 1024;
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image too large. Please choose a smaller image (max 500KB)');
    }

    // Convert file to base64
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    // Update user profile with base64 image
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      photoURL: base64String,
      updatedAt: new Date().toISOString()
    });

    return base64String;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

export { db, auth };