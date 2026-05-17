# TRUST Rating & Stability Fix Report

## Rating ladder
- Returned the TRUST ladder: Iron, Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Elite, Legend.
- Compressed the rating spread so the maximum visible rank starts at **2000 Rating** instead of 2700.
- Updated backend `rankService.js` and all frontend fallback rank tables.

## Frontend stability
- Added request timeout protection to API calls so a slow Railway/network request cannot leave the UI feeling frozen forever.
- Added per-action UI locks for queue, cancel, create/leave party actions to prevent double-click/race glitches.
- Buttons are restored after success/failure and the UI rerenders after each action.
- Current match panel now hides finished/closed/timed-out rooms more aggressively.

## Backend stability
- Queue join is now idempotent: if the user is already queued, `/queue/join` returns the current queue instead of throwing a confusing lock error.
- Queue cancel is now safer/idempotent when no party exists.
- Added stale party healing for parties stuck in `searching` or `in_match` after old/cancelled/finished flows.
- Leaving party now cancels an active queued entry and reopens the remaining party instead of leaving it in a broken searching state.
- Party invite TTL increased from 10 seconds to 60 seconds.

## Notes
- SourceMod `.sp` files were not compiled here because `spcomp` is not available in this environment.
- After uploading the backend to Railway, redeploy and check logs.
