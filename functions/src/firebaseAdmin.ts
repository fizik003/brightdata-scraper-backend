import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  admin.initializeApp();
}

export const adminDb = admin.firestore();
