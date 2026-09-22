import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Gives `next dev` local D1 bindings (via Miniflare) so the forum
// works fully offline with zero setup.
if (process.env.NODE_ENV === 'development') {
  try {
    initOpenNextCloudflareForDev();
  } catch (e) {
    console.warn('[YoriForum] Cloudflare dev platform unavailable:', e?.message);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true }, // no image optimizer on Workers
};

export default nextConfig;
