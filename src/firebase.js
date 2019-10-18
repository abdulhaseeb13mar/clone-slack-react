import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
var firebaseConfig = {
  apiKey: "AIzaSyB0hfsTp80GTQZIm5SOVJJK2NULtSGsYcQ",
  authDomain: "clone-slack-react-f2b16.firebaseapp.com",
  databaseURL: "https://clone-slack-react-f2b16.firebaseio.com",
  projectId: "clone-slack-react-f2b16",
  storageBucket: "clone-slack-react-f2b16.appspot.com",
  messagingSenderId: "492301238572",
  appId: "1:492301238572:web:e60139a7efc7bc285b6c89",
  measurementId: "G-WN7PXZ2HKG"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
