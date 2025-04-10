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

export async function saveBookReview(reviewData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const review = {
      ...reviewData,
      id: reviewData.id || crypto.randomUUID(), // Generate a unique ID if not provided
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "reviews"), review);
    return docRef.id;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
}

export async function fetchUserReviews() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const userReviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return userReviews;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
}

export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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

export async function deleteReview(reviewId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // Query for the document with matching id attribute
    const reviewsCollection = collection(db, "reviews");
    const q = query(
      reviewsCollection, 
      where("id", "==", reviewId),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Review not found");
    }

    // Delete the document using its document ID
    const reviewDoc = querySnapshot.docs[0];
    await deleteDoc(doc(db, "reviews", reviewDoc.id));
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

export async function fetchReview(reviewId) {
  try {
    if (!reviewId) throw new Error("Review ID is required");
    
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const reviewsCollection = collection(db, "reviews");
    const q = query(reviewsCollection, where("id", "==", reviewId), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Review not found");
    }

    const reviewDoc = querySnapshot.docs[0];
    return { id: reviewDoc.id, ...reviewDoc.data() };
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
}

export async function updateReview(reviewId, updatedData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to update a review");

    // Query for the document with matching id attribute
    const reviewsCollection = collection(db, "reviews");
    const q = query(
      reviewsCollection, 
      where("id", "==", reviewId),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Review not found");
    }

    // Update the document using its document ID
    const reviewDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, "reviews", reviewDoc.id), {
      ...updatedData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
}

export { db, auth };