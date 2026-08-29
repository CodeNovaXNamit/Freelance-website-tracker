import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore (default database is used, or specify if needed based on config)
// The config specifies firestoreDatabaseId, but the client SDK usually connects to the default unless specified.
// For AI Studio, we need to pass the databaseId if it's not default.
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId !== '(default)' ? firebaseConfig.firestoreDatabaseId : undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add Workspace scopes for integration
provider.addScope('https://www.googleapis.com/auth/drive.file');

export { app, db, auth, provider };
