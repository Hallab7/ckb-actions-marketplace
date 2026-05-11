# Frontend Testing Guide

End-to-end testing checklist for the CKB Actions Marketplace on testnet.

## Prerequisites

- Dev server running: `pnpm dev` inside `frontend/`
- Browser open at `http://localhost:3000`
- JoyID wallet installed (or any CCC-compatible wallet)
- Testnet CKB in your wallet (claim from https://faucet.nervos.org)
- You need **two separate wallet accounts** to test the full flow:
  - Account A — the task poster
  - Account B — the worker (claimer)
  - Either account can be the reviewer (use Account A for simplicity)

---

## Test 1 — Wallet Connection

**Steps:**
1. Open `http://localhost:3000`
2. Click "Connect Wallet" in the top-right navbar

**What to check:**
- A CCC modal opens with wallet options (JoyID, MetaMask, etc.)
- After connecting, the navbar shows your shortened address (e.g. `ckt1qzda...u7vjur`)
- A green dot appears next to the address
- A "Disconnect" link appears

**Pass:** Address visible in navbar with green dot.

---

## Test 2 — Browse Page Loads

**Steps:**
1. Open `http://localhost:3000`
2. Wait for the page to load

**What to check:**
- Stats bar shows 4 numbers (Open Tasks, CKB Available, Completed, Total Tasks)
- If no tasks exist on-chain yet, all stats show 0 and the grid shows "No tasks found"
- Skeleton loading cards appear briefly while fetching from the indexer
- No red error banners (if you see "Failed to load tasks" it means the indexer is unreachable)
- Search box and filter buttons are visible and clickable

**Pass:** Page loads without errors. Stats bar renders. Grid shows tasks or empty state.

---

## Test 3 — Post a Task

**Steps (as Account A):**
1. Connect Account A
2. Click "Post Task" in the navbar or the CTA button at the bottom of the browse page
3. Fill in the form:
   - Title: `Test task - please ignore`
   - Description: `This is a test task created to verify the marketplace is working.`
   - Reward: `100` (CKB)
   - Deadline: `99999` (a future block number)
   - Reviewer Address: paste your own Account A address (you'll be both poster and reviewer)
4. Verify the Summary box appears showing reward, deadline, and reviewer
5. Click "Post Task & Lock Reward"
6. Approve the transaction in your wallet

**What to check:**
- Button changes to "Sending transaction..." while pending
- After wallet approval, a success screen appears with a transaction hash
- The tx hash is a clickable link to `testnet.explorer.nervos.org`
- On the explorer, the transaction shows status "Committed"
- The output cell has your task-lock script as the lock and task-type script as the type
- Cell data is non-empty (contains your encoded task data)

**Pass:** Transaction committed on-chain. Success screen shown with valid explorer link.

---

## Test 4 — Task Appears in Browse

**Steps:**
1. After posting, click "Back to Marketplace"
2. Wait ~10 seconds for the indexer to pick up the new cell
3. Refresh the page

**What to check:**
- Your new task card appears in the grid
- Status badge shows "Open" (green)
- Reward shows `100 CKB`
- Title matches what you entered
- Clicking the card navigates to the task detail page

**Pass:** Task card visible with correct data and "Open" status.

---

## Test 5 — Task Detail Page

**Steps:**
1. Click on your posted task card

**What to check:**
- Title, description, reward, and deadline all match what you posted
- Status badge shows "Open"
- Progress steps: "Posted" is checked, others are unchecked
- "Claim Task" button is visible
- "Cancel" button is visible next to it
- On-chain Info section shows the real tx hash (not mock data)
- Tx hash link opens the correct testnet explorer page

**Pass:** All data matches on-chain values. Buttons are visible.

---

## Test 6 — Claim a Task

**Steps (as Account B):**
1. Disconnect Account A, connect Account B
2. Navigate to the task detail page for the task posted in Test 3
3. Click "Claim Task"
4. Approve the transaction in your wallet

**What to check:**
- Button shows "Sending..." while pending
- Success banner appears at the top with a tx hash
- After ~10 seconds, refresh the page
- Status badge changes from "Open" to "Claimed" (blue)
- Progress steps: "Posted" and "Claimed" are both checked
- "Submit Proof" button is now visible
- "Claim Task" button is gone

**Pass:** Status changed to "Claimed" on-chain. Submit button visible.

---

## Test 7 — Submit Proof

**Steps (still as Account B):**
1. On the claimed task detail page, click "Submit Proof"
2. Approve the transaction

**What to check:**
- Success banner with tx hash appears
- After refresh, status changes to "Under Review" (amber)
- Progress steps: Posted, Claimed, Submitted all checked
- "Approve" and "Reject" buttons are now visible
- "Submit Proof" button is gone

**Pass:** Status changed to "Under Review". Approve/Reject buttons visible.

---

## Test 8 — Approve Task

**Steps (as Account A — the reviewer):**
1. Disconnect Account B, connect Account A
2. Navigate to the submitted task
3. Click "Approve"
4. Approve the transaction

**What to check:**
- Success banner with tx hash appears
- After refresh, status changes to "Completed" (gray)
- All 4 progress steps are checked
- A green completion message replaces the action buttons: "✓ Task completed. Reward has been released."
- No more action buttons

**Pass:** Status "Completed". All steps checked. Completion message shown.

---

## Test 9 — Cancel a Task (Optional)

**Steps (as Account A):**
1. Post a new task (repeat Test 3)
2. On the task detail page, click "Cancel" (next to Claim Task)
3. Approve the transaction

**What to check:**
- Transaction commits successfully
- The task cell no longer appears in the browse page after refresh
- Your CKB balance is restored (minus tx fee)

**Pass:** Task disappears from browse. CKB returned to poster.

---

## Test 10 — Dashboard

**Steps:**
1. Connect Account A
2. Navigate to `/dashboard`

**What to check:**
- Your wallet address is shown below the "Dashboard" heading
- "Tasks Posted" count matches how many tasks you've posted
- "CKB Locked" shows the total reward of your non-completed tasks
- "Posted by me" tab shows your posted tasks
- Switch to "Claimed by me" tab — shows tasks you claimed as a worker
- Each task card links to the correct detail page

**Pass:** Dashboard shows correct counts and tasks for the connected wallet.

---

## Test 11 — Reject Flow (Dispute)

**Steps:**
1. Post a task as Account A with Account A as reviewer
2. Claim it as Account B
3. Submit proof as Account B
4. As Account A (reviewer), click "Reject" instead of "Approve"

**What to check:**
- Status changes to "Disputed" (red badge)
- A red message appears: "This task is under dispute. Awaiting reviewer resolution."
- No action buttons (dispute resolution is a future feature)

**Pass:** Status shows "Disputed" with the dispute message.

---

## Quick Sanity Checks

| Check | Expected |
|-------|----------|
| Stats bar updates after posting | Open count increases by 1 |
| Skeleton loaders show on first load | 6 gray animated cards |
| Error banner on indexer failure | Amber banner with "Retry" button |
| Explorer links open correct tx | Testnet explorer shows committed tx |
| Wallet not connected on /post | Button says "Connect Wallet to Post" |
| Wallet not connected on /dashboard | Prompt to connect wallet |
| Filter buttons work | Only tasks with matching status shown |
| Search filters by title and description | Matching tasks shown, others hidden |

---

## Common Issues

**"Failed to load tasks from chain"**
The indexer query failed. Check your internet connection. The page falls back to mock data automatically.

**Transaction rejected with error code 1**
The task-type script returned `IndexOutOfBound`. Make sure you're using the latest deployed scripts (v2). Check `lib/scripts.ts` has the correct code hashes.

**Transaction rejected with error code 7**
Unauthorized action. You're trying to perform an action as the wrong party (e.g. claiming as the poster, or approving as the worker).

**Task doesn't appear after posting**
The indexer takes 10–30 seconds to index new cells. Wait and refresh.

**"Connect Wallet to Post" button doesn't open modal**
The CCC Provider may not be wrapping the page. Check `app/providers.tsx` is imported in `app/layout.tsx`.
