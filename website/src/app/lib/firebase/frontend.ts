// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCzEnLBosTSHE8XAQOOKECuc--3uCkD9FM',
  authDomain: 'family-print-90a85.firebaseapp.com',
  projectId: 'family-print-90a85',
  storageBucket: 'family-print-90a85.appspot.com',
  messagingSenderId: '522848419775',
  appId: '1:522848419775:web:c3bfc67d4e8d788a9c2b0a',
};

// // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export {auth, googleProvider};
