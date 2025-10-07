install
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Verifying admin access to Firebase

Run the helper script to confirm that the provided admin credentials can authenticate, resolve an admin role, and query the document library through Firestore:

```bash
FIREBASE_TEST_PASSWORD="<admin password>" npm run verify:admin
```

You can override the default email or API key by supplying `FIREBASE_TEST_EMAIL`, `FIREBASE_API_KEY`, or CLI flags such as `--email=user@example.com`. The script requires outbound network access; if you are working offline it will exit with a network error once it attempts to contact Firebase.
