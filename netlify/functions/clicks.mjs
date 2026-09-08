// Artwork click counter — Netlify Function backed by Netlify Blobs.
//
// Static site stays static: the frontend only fires a one-way POST on modal
// open. Counts live in the site's blob store (no database to provision).
//
//   POST /api/clicks?code=A514  → record one click, returns 204
//   GET  /api/clicks            → { "A514": 3, "B106": 0, ... }
//
// Each click is one blob under "c/<CODE>/<timestamp>-<random>". Writing a new
// key never races (unlike a shared counter), so no compare-and-set or retry
// loop is needed and no update can be lost.
//
// Auto-configures inside Netlify. NETLIFY_BLOBS_* envs are only for local
// testing against a BlobsServer.
import { getStore } from '@netlify/blobs';

function openStore() {
  const edgeURL = process.env.NETLIFY_BLOBS_EDGE_URL;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  const siteID = process.env.NETLIFY_SITE_ID;
  return edgeURL
    ? getStore({ name: 'art-clicks', edgeURL, token, siteID })
    : getStore('art-clicks');
}

const CODE = /^[A-Z0-9]{2,6}$/;

export default async (req) => {
  const store = openStore();
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') || '').toUpperCase();

  if (req.method === 'POST') {
    if (!CODE.test(code)) return new Response('ongeldige code', { status: 400 });
    // Unique key per click: no two clicks ever share a key, so concurrent
    // clicks cannot overwrite each other.
    const key = `c/${code}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await store.set(key, '1');
    return new Response(null, { status: 204 });
  }

  // GET — count the clicks per code (codes with zero clicks are absent).
  const counts = {};
  const { blobs } = await store.list({ prefix: 'c/' });
  for (const { key } of blobs) {
    const code = key.split('/')[1];
    counts[code] = (counts[code] || 0) + 1;
  }
  return Response.json(counts);
};

// ponytail: one blob per click grows the store unboundedly. Fine for an
// auction gallery (≈ hundreds of clicks). If counts ever reach ~10⁵, switch
// to a shared counter blob + atomic CAS, or export the numbers periodically.
