import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBggKTUrC-i48KVWzH0UyPE1CIIo0OL-Uk",
  authDomain: "a3-motors.firebaseapp.com",
  projectId: "a3-motors",
  storageBucket: "a3-motors.firebasestorage.app",
  messagingSenderId: "373220728983",
  appId: "1:373220728983:web:33bf6c40e10e64990409d2",
};

const app = initializeApp(firebaseConfig);

export default app;