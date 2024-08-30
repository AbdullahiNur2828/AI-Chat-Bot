// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

let app;
let analytics;
let db;
let auth;

// Ensure Firebase is only initialized in the client
if (typeof window !== 'undefined') {
  // Check if the app is already initialized
  if (!getApps().length) {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAXuIKG51Iwmm3JcJvr54Un0TA_mBS3rgE",
      authDomain: "chat-assitant.firebaseapp.com",
      projectId: "chat-assitant",
      storageBucket: "chat-assitant.appspot.com",
      messagingSenderId: "101758648692",
      appId: "1:101758648692:web:bbf225efb3f0d0464d6c21",
      measurementId: "G-P0YEY296MY"
    };

    console.log('Initializing Firebase app');
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized:', app);

    // Initialize Firebase Analytics only in the browser
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  } else {
    app = getApp();
  }

  // Initialize Firestore and Auth services
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('Firebase services initialized:', { analytics, db, auth });
}

export { db, auth };
