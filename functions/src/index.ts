import * as functions from "firebase-functions";
import { adminDb } from "./firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const fetchResults: any = async (id: string) => {
  const apiKey = process.env.BRIGHTDATA_API_KEY;

  const res = await fetch(`https://api.brightdata.com/dca/dataset?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data: any = await res.json();

  if (data.status === "building" || data.status === "collecting") {
    console.log("not complete yet, trying again...");

    return fetchResults(id);
  }

  return data;
};

export const onScraperComplete = functions.https.onRequest(
  async (request, response) => {
    console.log("SCRAPE COMPLEtE >>> : ", request.body);

    const { success, id } = request.body;

    if (!success) {
      await adminDb.collection("searches").doc(id).set(
        {
          status: "error",
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }

    const data = await fetchResults(id);
    await adminDb.collection("searches").doc(id).set(
      {
        status: "complete",
        updatedAt: Timestamp.now(),
        results: data,
      },
      {
        merge: true,
      }
    );

    response.send("Scraping Function Finished");
  }
);

// https://2500-37-214-62-107.eu.ngrok.io/brightdata-yt-build-160c1/us-central1/onScraperComplete
