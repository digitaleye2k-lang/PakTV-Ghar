# PakTV Ghar Community — Supabase setup

## Activation status
The Community pages and API clients are deployed but **deliberately disabled** until a real Supabase project is configured, security policies are applied and checked, and the site operator verifies the moderating team. The GitHub Pages site alone cannot safely store public chat or private reports. Never advertise an untested "live" anonymous chat.

## Step 1 — create/select a Supabase project
1. Open the [Supabase dashboard](https://supabase.com/dashboard) and select the project you control.
2. In **Authentication → Providers**, enable **Anonymous sign-ins**. Enable CAPTCHA / bot protections for anonymous sign-up, because guests could otherwise create unlimited new identities. Configure rate limits appropriate to the traffic.
3. In **Authentication → URL Configuration**, add both the existing Pages URL and any active custom domain as redirect URLs:
   - \`https://digitaleye2k-lang.github.io/PakTV-Ghar/community.html\`
   - \`https://retroworld.eu.cc/community.html\` (only after DNS is working)
   - \`https://www.retroworld.eu.cc/community.html\` (only if www is configured)
4. Keep Email provider enabled for staff sign-in, preferably with an existing invited user rather than allowing staff signup via the site.

## Step 2 — create the database and policies
Open **SQL Editor → New query**, paste the entire file
[\`community/supabase-schema.sql\`](./supabase-schema.sql), and run it **once**.

This adds:
- Room-tagged public message records, separate non-public abuse reports and contact / moderator applications.
- Server-side profanity, slur, contact-info and link checks; guest-based 20-second cooldown and daily posting/report limits.
- Moderator-only hidden-message review, and owner-only contact / report / volunteer inbox.
- A deduplicated daily visitor hash table and aggregate country counts; raw IPs are never written into these tables.
- PostgreSQL Row Level Security; **the browser cannot directly insert messages or retrieve private submissions**. Public chat is read-only apart from restricted validated RPC calls.

**Important**: The included phrase filter is a first line of defence, not complete human-language moderation. Bilingual code-switching, evasion and subtle threats still require human review. The site is family-friendly; never let users send private messages, files or personal details through chat.

## Step 3 — deploy the visitor Edge Function
Use **Edge Functions → Deploy a new function → Via Editor**, name the function \`community-visit\`, then paste the content of
[\`community/edge-functions/community-visit/index.ts\`](./edge-functions/community-visit/index.ts). Deploy it.

For this public analytics endpoint, set **Verify JWT = OFF** in the function settings (it enforces an origin allowlist and uses the private Supabase service credential internally). In **Edge Function Secrets** configure:
- \`VISITOR_HASH_SECRET\`: a long random secret with at least 32 characters (never publish it).
- \`VISITOR_GEO_LOOKUP\`: \`true\` if visitors have been informed that their IP may be sent to ipwho.is to estimate a country; otherwise \`false\` (countries may appear as Unknown).

Supabase automatically supplies the internal \`SUPABASE_URL\` and \`SUPABASE_SERVICE_ROLE_KEY\` variables. **Never add the service key to GitHub Pages or to a public file.**

The visitor counter is **optional**. It only records a visit when the visitor clicks **Count my visit** and agrees to the displayed notice. Opening either page or viewing public statistics alone does not call the recording function. The count is approximately unique per IP/browser/day and can undercount households or misidentify geographic regions. Each day's visitor digest is deleted during subsequent recording after seven days, while anonymous aggregate totals are kept.

## Step 4 — configure the public browser client
In **Project Settings / Connect / API Keys** find the project's URL and its **publishable** key (also called the legacy **anon** key on older projects).

In the repo root [\`community-config.js\`](../community-config.js), set ONLY:
\`\`\`js
window.PAKTV_COMMUNITY_CONFIG = Object.freeze({
  supabaseUrl: "https://YOUR-REF.supabase.co",
  publishableKey: "sb_publishable_YOUR_PUBLIC_KEY",
  analyticsFunction: "community-visit"
});
\`\`\`
A Supabase **publishable/anon** key is intended to be embedded in the browser. Treat the **service_role** and other secret/admin keys as highly confidential; never copy those into a GitHub repository.

When this configuration is populated, the UI will enable forms and public chat. Before sharing, test it from a private/incognito browser and check that no private submissions or other users' guest identifiers are accessible over the public REST API.

## Step 5 — add verified owner and moderators
Anonymous visitors can only apply; they cannot grant themselves roles.

For the owner:
1. In **Authentication → Users**, invite an email address that you control for owner sign-in.
2. Open the community page → **Show chat → Moderator / site owner sign-in**. Enter that email and follow the secure login link.
3. In Supabase Authentication, find that person's **User UID**.
4. In SQL Editor, substitute the legitimate UUID and run:
\`\`\`sql
insert into public.community_moderators (user_id,role)
values ('VERIFIED-USER-UUID','owner')
on conflict (user_id) do update set role='owner';
\`\`\`
5. Refresh the chat screen; you can now open the **Private owner inbox** to see contact messages, site reports and applications.

For another approved moderator, use the same reviewed invitation process and run the SQL with \`role='moderator'\`. Moderators can hide/restore/mark reported chat messages, but cannot read private inboxes. **Moderator applications never confer powers automatically.**

## Testing and maintenance
- **Public chat:** read and post messages from two independent guest browsers. Confirm messages and nicknames are HTML-escaped (the client uses \`textContent\`).
- **Filtering:** try harmless terms containing incidental substrings; ensure they are not blocked (e.g. “Pakistani”). Try an unambiguous name-calling insult and ensure rejection.
- **Reporting:** report a public comment; verify the owner/moderator review queue works. Note that three reports can temporarily hide a message pending review. Review false positives promptly.
- **Private:** check that the \`community_submissions\` and \`community_reports\` tables cannot be selected by a normal guest.
- **Visitor stats:** view them first without consenting; ensure no tracking call occurs. Then click **Count my visit**, confirm the new country total appears if the counter endpoint works.
- **Retention:** review and remove stale community messages and resolved private submissions regularly; use a scheduled database job if needed, and provide a contact path for data deletion requests.
- **Security:** enable email/anonymous Auth rate limits, CAPTCHA, database backups, Supabase logs and alerts. For growing traffic, migrate abusive-language checks to a better contextual moderation system (server-side) and monitor new rooms routinely.

## If ChatGPT Supabase is connected
Supabase can be connected to ChatGPT so project selection, SQL migration, function deployment and database verification can be performed through that integration when its project actions are available. Connecting/installing does not by itself choose a project, execute SQL or deploy functions.
