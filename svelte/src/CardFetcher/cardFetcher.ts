import { CachedDataStore } from "../util/dataFetcher";

export type RemoteCardData = {
  title: string;
  html: string;
  url: string;
};

export type CardData = RemoteCardData[];

let url =
  "https://script.google.com/macros/s/AKfycbwMbmd-9KnPDPyK3F-ziSLSSulwIpmvD0bja_s7N-trdiqAZLqgpsSocIAPHirLZb67/exec?cards=true";

export const cardFetcher = new CachedDataStore({
  url,
  name: "remote-cards",
  expiresAfter: 60 * 60 * 1000, // hourly
  defaultValue: [],
});

export async function fetchCards() {
  try {
    let request = await fetch(url, { redirect: "follow" });
    let cards = await request.json();
    console.log("Got Cards...", cards);
    return cards;
  } catch (err) {
    console.log("Error fetching", url);
    console.log(err);
    console.log(":(");
    throw err;
  }
}
