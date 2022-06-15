import { initializeApp } from "firebase/app";

import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqcSaRVCM8jpMshN3o9xwec1cE2H3qEDY",
  authDomain: "register-form-15731.firebaseapp.com",
  projectId: "register-form-15731",
  storageBucket: "register-form-15731.appspot.com",
  messagingSenderId: "811319950220",
  appId: "1:811319950220:web:d49a951352ef0ae2db34a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db=getFirestore(app)

export const storage=getStorage(app)