import 'server-only'
import admin from 'firebase-admin'

interface FirebaseAdminConfig {
  projectId: string
  clientEmail: string
  privateKey: string
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, '\n')
}

export function createFirebaseAdminApp(params: FirebaseAdminConfig) {
  const privateKey = formatPrivateKey(params.privateKey)

  if (admin.apps.length > 0) {
    return admin.app()
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: params.projectId,
      clientEmail: params.clientEmail,
      privateKey: privateKey,
    }),
  })
}

export async function initAdmin() {
  const params = {
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
  }

  return createFirebaseAdminApp(params)
}

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
      // During build time, if env vars are missing, we arguably shouldn't crash until usage.
      // However, if we return a mock or null, calls will fail.
      // Throwing here is better than crashing on import, as this function is only called when needed.
      throw new Error('Firebase Admin credentials are missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.')
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: formatPrivateKey(privateKey),
    }),
  })
}

export function getAuth() {
  return getFirebaseAdmin().auth()
}

export const firebaseAdmin = admin

