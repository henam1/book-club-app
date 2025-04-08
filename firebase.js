import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

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

export async function saveBookReview(review) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const reviewWithUser = {
      ...review,
      userId: user.uid,
      userEmail: user.email,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "reviews"), reviewWithUser);
    return docRef.id;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
}

// Function to fetch reviews for the logged-in user
export async function fetchUserReviews() {
  try {
    const user = auth.currentUser; // Get the currently logged-in user
    if (!user) throw new Error("User not logged in");

    const q = query(
      collection(db, "reviews"), // Changed from "bookReviews" to "reviews"
      where("userId", "==", user.uid) // Filter reviews by the logged-in user's ID
    );

    const querySnapshot = await getDocs(q);
    const userReviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched user reviews:", userReviews);
    return userReviews;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
}

// Function to register a new user
export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Function to log in a user
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
}

// Function to log out a user
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
}

export async function deleteReview(reviewId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const reviewRef = doc(db, "reviews", reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

export async function fetchReview(reviewId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const reviewRef = doc(db, "reviews", reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) return null;
    const reviewData = reviewSnap.data();

    // Verify the review belongs to the current user
    if (reviewData.userId !== user.uid) return null;

    return {
      id: reviewSnap.id,
      ...reviewData
    };
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
}

export async function updateReview(reviewId, updatedReview) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      ...updatedReview,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
}

export { db, auth };