import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5ikvHPK5Cih1NuOwyutlcQxN9PNrpr1E",
  authDomain: "microods.firebaseapp.com",
  projectId: "microods",
  storageBucket: "microods.firebasestorage.app",
  messagingSenderId: "762238568686",
  appId: "1:762238568686:web:6b6dd6c1e250a684e40bff",
  measurementId: "G-2TF5L7HMGQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveScore(name, score, level) {
  await addDoc(collection(db, "leaderboard"), {
    name,
    score,
    level,
    date: new Date()
  });
}

export async function getLeaderboard() {
  const q = query(
    collection(db, "leaderboard"),
    orderBy("score", "desc")
  );

  const querySnapshot = await getDocs(q);
  let results = [];

  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });

  return results;
}
