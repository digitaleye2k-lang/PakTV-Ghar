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
- Compatibility fix: the 468×60 banner loads through a separate `ad-banner.html` page, while the native and additional ad scripts are dynamically inserted into the normal page only after explicit opt-in. These external scripts are **not sandboxed** and may affect browsing; the extra category may show pop-ups/redirects. Verify real advertiser behaviour before promoting it widely.
- A Cookie settings button in the footer allows later withdrawal. Reload stops the ad scripts but does not delete existing third-party cookies.
- Domains: profitableratecpmnetwork.com and highrevenueformat.com.
- Owner to-do: provide private contact details and carry out a real ad/cookie audit; check whether a consent management platform is required. This implementation does not guarantee legal compliance.

## YouTube Data API: episode search

PakTV Ghar can optionally use the **YouTube Data API v3** through GitHub Actions. It does not expose an API key to browser visitors.

1. Create an API key in [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) and limit its **API restrictions** to **YouTube Data API v3**.
2. Open [repository Actions secrets](https://github.com/digitaleye2k-lang/PakTV-Ghar/settings/secrets/actions). Add a repository secret named `YOUTUBE_API_KEY`, using the key as its value.
3. Open [GitHub Actions](https://github.com/digitaleye2k-lang/PakTV-Ghar/actions/workflows/publish.yml) and choose **Run workflow**; after deployment, the website will use the static episode index.

**Security:** Never put the key in `index.html`, `youtube-state.json`, `refresh.py` or any public file. If a key was disclosed publicly or pasted into a conversation, rotate/delete it in Google Cloud and replace the GitHub secret with the new key. The GitHub connector used to edit this repository cannot configure repository secrets.

The indexer resolves broadcaster YouTube handles using `channels.list`, uses `search.list` separately for Great Britain and Pakistan, and verifies candidate videos with `videos.list`. It filters for full episodes with publisher/channel ownership, duration and episode titles, checks country restrictions and embed permission, and uses thumbnails where available. Both YouTube search and video publishing are subject to platform and rights-holder restrictions.

For quota safety, at most **8 search calls per refresh** and **80 search calls per Pacific-time day** are used, with a rolling group of dramas and cached public metadata for up to **14 days**. The index gradually fills in; it is not a complete archive or a geo-unblocking service. Video playback is controlled by YouTube, even when API metadata says a video is embeddable.

## Movie library
The new **Movies** tab (`#movies`) discovers full-length Pakistani film or movie-length drama uploads through the existing YouTube Data API / upload-playlist indexing. It starts with ARY Films (public channel `UC2PYniNHljOED9xNaMpiMiQ`) and Pakistani Movies by DRM, whose public handle is `@pakistani_movies`. The source metadata verifies the publishing YouTube channel ID before cataloguing each video.

The archive filters movie-source uploads to require a title describing a full movie, full film, or telefilm, runtime of **at least 60 minutes**, public status, and absence of trailer/music/episode terminology. Movie uploads may be older than the regular rolling news archive. The featured Sharpasand upload is linked directly from ARY Films based on a public movie listing; videos are still hosted on YouTube, not on PakTV Ghar. Full-movie labels sometimes mean **feature-length edits of TV serials** and should not automatically be treated as cinema releases or proof of rights everywhere. Regional availability and embedding can change.

## Google AdSense
The site includes a publisher-verification meta tag for account `ca-pub-7935805760564580`. Its exact publisher script (`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7935805760564580`) is inserted into the page **only when visitors opt in to Google AdSense advertising**, independently of the Adsterra categories. The consent version was updated to prompt every visitor again after introducing Google.

To show Google Auto ads, the site must be approved in AdSense and **Auto ads enabled**. For personalised Google AdSense traffic in the UK/EEA/Switzerland, the site operator must deploy a **Google-certified TCF-compliant CMP** (for example Google Privacy & messaging) in addition to reviewing the current cookie choices. The custom site banner is not a certified TCF platform, and Adsterra's additional pop-up script may conflict with Google ad quality and policy requirements. Review the ad experiences before enabling both networks widely.

## Community, visitor countries and contact

The site now includes [**Community**](./community.html) and an optional homepage visitor-count widget.

- A **country visitor dashboard** displays aggregate visits and country rankings. Recording a visit is optional and requires clicking **Count my visit**, with notice of temporary IP/browser processing.
- **Anonymous guest discussions** include separate General, Dramas, Movies, Comedy, Political shows and YouTubers rooms, with an anti-insult/slur filter, post limits, report buttons and human moderator review.
- **Contact Us**, **Report a problem** and **Moderator application** are private forms. Owners can review an authenticated private inbox; accepted moderators get separate restricted privileges.
- **No backend means no data collection**: pages display a clear setup notice and prevent chat/forms from submitting until Supabase is configured.

The complete backend schema, visitor-count Edge Function and setup instructions are in [community/SETUP.md](./community/SETUP.md).

**Important:** Installing the Supabase app or adding these website files does not create tables in a particular project. Choose a real Supabase project, run its schema migration, deploy the visitor function and add that project's **public** URL and **publishable** key to \`community-config.js\`. Never put a Supabase **service_role** key in the site or a repository. Enable CAPTCHA and moderate public chat before launching widely.
