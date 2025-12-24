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

// Initialize default app
if (!admin.apps.length) {
   admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle escaped newlines in private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const firebaseAdmin = admin
export const auth = admin.auth()
