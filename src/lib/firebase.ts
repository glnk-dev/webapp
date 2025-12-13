import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GithubAuthProvider } from 'firebase/auth';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { isStatic } from '../utils/env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;
let githubProvider: GithubAuthProvider | null = null;

if (!isStatic()) {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: 'glnk-dev.firebaseapp.com',
    projectId: 'glnk-dev',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    githubProvider = new GithubAuthProvider();
    githubProvider.addScope('read:user');
    githubProvider.addScope('user:email');
    functions = getFunctions(app, 'us-central1');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export interface LinkData {
  subpath: string;
  redirectLink: string;
}

export const requestSignup = functions
  ? httpsCallable<{ username: string; links: LinkData[] }, { success: boolean; file_url: string }>(functions, 'request_signup')
  : null;

export const updateLinks = functions
  ? httpsCallable<{ username: string; links: LinkData[] }, { success: boolean; file_url: string }>(functions, 'update_links')
  : null;

export { auth, githubProvider };
export default app;
