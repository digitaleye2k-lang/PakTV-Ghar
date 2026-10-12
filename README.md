# PakTV Ghar — پاک ٹی وی گھر

Family-friendly Pakistani drama, news, comedy, politics and vlogger portal.

## Publish on GitHub Pages
Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**. Then go to **Actions → Update and deploy PakTV Ghar → Run workflow** to build and publish. Your address will be shown in Settings → Pages, usually https://digitaleye2k-lang.github.io/PakTV-Ghar/.

The website is served by GitHub Pages and requires no continuous Python server. GitHub Actions runs approximately every 3 hours to fetch available YouTube RSS uploads and broadcaster schedules, then deploys fresh JSON. GitHub scheduling is best effort, and some official sites block automated fetching. If feeds are unavailable, the curated drama list and publisher links remain usable. Full old-episode search opens YouTube; it is not equivalent to a complete indexed archive.

No VPN or geo-restriction bypass is provided; playback depends on publisher and YouTube permissions. Videos remain on official YouTube channels. Favourites are stored in each visitor's browser.


## Copyright and content disclaimer
PakTV Ghar is an independent discovery directory. It does not host, upload or store third-party television episodes or video files. Videos are linked to or embedded from the original third-party platforms, subject to publisher permissions and availability. Programme copyrights, trademarks and third-party artwork remain with their respective owners; the site is not affiliated with or endorsed by them. Refer to [the public disclaimer](./disclaimer.html) for full information and link-removal requests. A disclaimer does not replace permissions or compliance with copyright and YouTube rules.

## Cookie consent & advertising
- [Privacy & Cookies Policy](./privacy.html) explains browser storage, third-party advertising and video embeds.
- Consent is versioned and stored locally. No Adsterra script tags appear directly in index.html; third-party ad code loads only after active opt-in.
- Separate optional choices for display ads (native + 468x60 banner) and the additional ad script. Both are off by default.
- Third-party ad creatives run within sandboxed frames. Some ad placements may not support this; real advertiser display must be tested.
- A Cookie settings button in the footer allows later withdrawal. Reload stops the ad scripts but does not delete existing third-party cookies.
- Domains: profitableratecpmnetwork.com and highrevenueformat.com.
- Owner to-do: provide private contact details and carry out a real ad/cookie audit; check whether a consent management platform is required. This implementation does not guarantee legal compliance.
