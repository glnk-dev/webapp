import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: 'glnk-dev.firebaseapp.com',
  projectId: 'glnk-dev',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = {} as Auth;
}

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export { auth };
export default app as FirebaseApp;

