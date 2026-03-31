import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAl5oR3RvlgP8b9WvdxZaPvkc0rMb_R94M",
    authDomain: "aaasummit-d063e.firebaseapp.com",
    projectId: "aaasummit-d063e",
    storageBucket: "aaasummit-d063e.firebasestorage.app",
    messagingSenderId: "44977763419",
    appId: "1:44977763419:web:e3c5bd14fc98d724da3b7e",
    measurementId: "G-YWLCPLNLPZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, collection, query, where, getDocs };
