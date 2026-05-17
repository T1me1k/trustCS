# TRUST Rank System Spec v2

## Visible ladder
TRUST uses a compact 10-rank ladder. The maximum visible rank starts at **2000 Rating**.

| Rank | Min Rating |
|---|---:|
| Iron | 0 |
| Bronze | 225 |
| Silver | 450 |
| Gold | 675 |
| Platinum | 900 |
| Diamond | 1125 |
| Master | 1350 |
| Grandmaster | 1575 |
| Elite | 1800 |
| Legend | 2000 |

## UI logic
- Player profile shows current rank, rating, RP/progress to next rank, and next-rank target.
- Leaderboard uses the same backend `rankService.js`, with frontend fallback tables matching the backend.
- Legend is the top visible rank; players can still climb higher by raw Rating and leaderboard position.

## Backend source of truth
- `backend/src/services/rankService.js`

## Frontend fallback copies
- `frontend/app.js`
- `frontend/TRUST-app.js`
- `frontend/leaderboard.js`
