# NeighbourhoodLink

Hyper-local digital marketplace & community connection platform for Group 1.

## Stack
- Expo SDK 57 + React Native 0.86
- Expo Router
- TypeScript
- Firebase Authentication, Firestore, Cloud Storage
- AsyncStorage demo persistence
- GitHub + Jira ready

Expo's current documentation recommends SDK 57 for new projects, with React Native 0.86 and TypeScript support. The app uses Expo Router for file-based routing. Firebase is configured through the modular JavaScript SDK and environment variables.

## Run
1. Install Node.js 22.13+.
2. `npm install`
3. `cp .env.example .env`
4. Leave `.env` blank for demo mode, or add the Firebase Web App values.
5. `npx expo start`

## Firebase setup
Create a Firebase project and register a Web App. Enable:
- Authentication → Email/Password
- Firestore Database
- Storage

The repository also includes `firestore.rules`, `storage.rules`, and `firebase.json` as a starting security configuration.

Put the web app configuration values in `.env` using the `EXPO_PUBLIC_...` names from `.env.example`.

## Demo mode
Without Firebase configuration, the app uses sample listings, posts, services, reviews and messages. In-app notifications come from that activity, and AsyncStorage saves your changes by account. Device push delivery is available after configuring a live Firebase and Expo project.

## Core routes
The project implements the 15 proposal views:
1. Splash / entry
2. Login / Registration
3. Home Dashboard
4. Marketplace
5. Listing Details
6. Create Listing
7. Search & Filter
8. Messages / Chat
9. Community Feed
10. Create Community Post
11. Services
12. User Profile
13. Reviews & Ratings
14. Notifications
15. Settings


## Navigation update

The primary tab navigation is **Home, Marketplace, Community, Messages, Profile**. **Services** is no longer a primary tab; users access local services from the **Services** category inside Marketplace. The dedicated service detail route remains available for provider/service details.

## Completed interactions

- Create sale, borrow, giveaway, and service offers. Services have availability and a per-session rate.
- Open community posts from the feed or home screen; like/unlike and comment.
- Edit your listings and change their availability; owners cannot message themselves.
- Message service providers directly. Message failures keep the draft available to retry.
- View and submit neighbour reviews from a conversation or listing; profile counts and ratings use actual data.
- In-app notifications are generated from incoming messages, reviews, community posts, and reactions to your posts. Opening one marks it read and routes to its content.
- Save preferences and a manually entered neighbourhood. Reports are stored privately; demo reports stay on the device.
- Firebase mode uses live subscriptions, participant-only message queries, and empty states rather than sample data. Local caches and read state are scoped to each account.

## Verification

Run `npm run typecheck` and `npm test`. Run `npm run test:rules` for Firebase emulator access tests (Java and a first-time emulator download are required). The emulator command uses a demo project and never deploys to a live project.

For a web bundle check: `npx expo export --platform web --output-dir /tmp/neighbourhoodlink-web`.

## Native push delivery

The app includes notification permission/token registration, routing when an alert is opened, and server handlers for messages, new reviews, community posts, comments, and likes. Expo Go and the web app show a clear explanation when device push is unavailable. In-app notifications work without native push.

Live delivery still requires configuration:

1. Configure Firebase Authentication, Firestore, Storage, and the app's Firebase variables.
2. Link your Expo project and set `EXPO_PUBLIC_EAS_PROJECT_ID` to its UUID. Configure Android FCM and/or iOS APNs credentials through EAS.
3. Install server dependencies with `npm install --prefix functions`. Cloud Functions deployment requires a Firebase project with billing enabled.
4. Deploy rules and functions to the chosen project after reviewing the changes: `npx firebase deploy --project YOUR_PROJECT_ID --only firestore:rules,storage,functions`.
5. Build/install a native preview using the `preview` profile in `eas.json`, enable device push in Settings, and test with two accounts on physical devices.

The server checks push preferences, batches deliveries, records receipts, and disables unregistered devices. Delivery jobs reduce duplicates on trigger retries; delivery is not guaranteed exactly once. Community broadcasts currently follow the shared community feed rather than a GPS radius.

Reports can be reviewed in the Firebase console by the project operator. A signed-in account with an `admin` custom claim can read reports through Firestore; no moderation dashboard is included. Review submissions are member-authored and are not presented as verified transactions.

### Current verification results

TypeScript checks and 15 behavior tests pass, including screen navigation, ownership checks, persistence, and push batching. Web, Android, and iOS JavaScript bundles export successfully. This is bundle validation, not a signed native build or physical-device test.

Firebase rule tests are included, but on this machine the Firestore emulator times out while loading rules, before assertions execute. Rules are not yet verified in the emulator or deployed. The browser connection also failed before UI testing could start; screen handlers were tested with the React renderer instead.

## Current free-plan setup

Authentication and Firestore are configured for `neighbourhoodlink-6cbd6`. Keep `EXPO_PUBLIC_ENABLE_STORAGE=false` and `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false` while using the Spark plan. Listings use the default remote image; photo picking is disabled in Firebase mode. In-app notifications remain active.

After provisioning Storage, deploying its rules, and confirming uploads, set `EXPO_PUBLIC_ENABLE_STORAGE=true`. After deploying push functions and configuring native device delivery, set `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true`. Restart Expo whenever environment settings change.

### Cloudinary photo uploads on the free Firebase plan

Create an unsigned upload preset in Cloudinary Settings → Upload → Upload presets. Set allowed formats to images (jpg, jpeg, png, webp, heic) and a maximum file size appropriate for your account, such as 10 MB. Add the cloud name and preset name to `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` and `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in `.env`, then restart Expo. The listing photo picker becomes available and stores the uploaded HTTPS image URL in Firestore. No Cloudinary SDK, API key, or API secret is required. Uploaded listing images are publicly accessible by URL. Keep Firebase Storage disabled. Cloudinary free usage is subject to its account quotas.

Listings support up to six photos during creation and editing. Manage listing offers photo replacement/removal and permanent listing deletion with confirmation. The first photo is the card cover; details show the full gallery. Removing a photo or listing removes its reference from Firestore; hosted Cloudinary assets remain in the media library and can be deleted there.
