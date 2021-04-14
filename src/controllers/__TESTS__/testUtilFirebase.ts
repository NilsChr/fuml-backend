import firebase from "firebase";
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({
  path: path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`),
});

const config = {
  apiKey: process.env.FIREBASE_APP_API_KEY,
  authDomain: "bogsynth.firebaseapp.com",
  databaseURL: "https://bogsynth.firebaseio.com",
  projectId: "bogsynth",
  storageBucket: "bogsynth.appspot.com",
  messagingSenderId: "359303561397",
  appId: "1:359303561397:web:2d73a7613b08ebd2",
};

firebase.initializeApp(config);

let tokens = {
  token1: '',
  token2: ''
}

const testUtilFirebase = {
  async loginFirebase() {
    if(tokens.token1 !== '') return tokens.token1;
    const email = process.env.FIREBASE_LOGIN_EMAIL;
    const password = process.env.FIREBASE_LOGIN_PASSWORD;

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    } catch (e) {}

    const user = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const token = await firebase.auth().currentUser.getIdToken();
    tokens.token1 = token;
    return token;
  },
  async loginFirebase2() {
    if(tokens.token2 !== '') return tokens.token2;

    const email = process.env.FIREBASE_LOGIN_EMAIL2;
    const password = process.env.FIREBASE_LOGIN_PASSWORD2;

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    } catch (e) {}

    const user = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const token = await firebase.auth().currentUser.getIdToken();
    tokens.token2 = token;
    return token;
  },
  async signOut() {
    await firebase.auth().signOut();
  }
};
export default testUtilFirebase;
