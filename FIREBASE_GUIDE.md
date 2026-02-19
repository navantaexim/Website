# Firebase Storage Setup for Seller Documents

This guide helps you set up Firebase Storage to handle seller document uploads and link them to your Supabase database.

## 1. Firebase Console Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Navigate to **Storage** in the left sidebar and click **Get Started**.
4.  Choose **Start in production mode**.
5.  Select a region (e.g., `asia-south1` for India) and click **Done**.

## 2. Configure Storage Rules

Update your Firebase Storage Rules to allow authenticated users to upload their own documents.

1.  Go to the **Rules** tab in the Storage verify.
2.  Replace existing rules with the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only allow authenticated users to read/write their own seller documents
    match /seller-docs/{sellerId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3.  Click **Publish**.

## 3. Configure CORS (Cross-Origin Resource Sharing)

To allow uploads from your localhost or deployed app, you must configure CORS.

1.  Create a file named `cors.json` locally:

```json
[
  {
    "origin": ["http://localhost:3000", "https://your-production-domain.com"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
```

2.  Install `gsutil` (part of Google Cloud SDK) or use the Google Cloud Console online shell.
3.  Run the command:
    `gsutil cors set cors.json gs://<your-storage-bucket-name>`
    *(Replace `<your-storage-bucket-name>` with the bucket name from Firebase Console, e.g., `navanta-exim.appspot.com`)*.

## 4. Environment Variables

Ensure your `.env.local` file has the correct Firebase configuration keys. These are used by `lib/firebase.ts`.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 5. Database Schema Update

Run the following command to ensure your Supabase database has the `SellerDocument` table:

```bash
npx prisma db push
```

## 6. Implementation Verification

Your code in `components/seller/onboarding/seller-document-section.tsx` implements the upload correctly:
1.  **Frontend**: Uses `uploadBytes` to upload file to Firebase Storage path `seller-docs/{sellerId}/...`.
2.  **Backend**: Calls `/api/seller/documents` with the resulting URL.
3.  **Database**: The API route saves the URL into the `SellerDocument` table linked to the `Seller`.
