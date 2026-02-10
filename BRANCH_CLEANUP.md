# Branch Cleanup Documentation

## Overview
This document identifies 21 stale branches in the repository that should be deleted. These branches are associated with closed or merged pull requests and are no longer needed.

## Branches to Delete

### Merged and Closed Branches (20 branches)

The following branches have associated pull requests that have been merged or closed:

| Branch Name | Status | Notes |
|-------------|--------|-------|
| `claude/add-button-feature-4LGiM` | Merged | PR merged on 2026-02-05 |
| `claude/add-station-checklist-Y3CV2` | Merged | PR merged on 2026-02-05 |
| `claude/clip-edit-delete-features-B2zJ8` | Merged | PR merged on 2026-02-06 |
| `claude/enhance-clip-marker-szQre` | Merged | PR merged on 2026-02-06 |
| `claude/fix-clip-marker-2WKbl` | Merged | PR merged on 2026-02-05 |
| `claude/fix-turbopack-lint-Ners8` | Merged | PR merged on 2026-02-06 |
| `claude/improve-clip-tracker-RR8W4` | Merged | PR merged on 2026-02-05 |
| `claude/polish-player-cards-No5gL` | Merged | PR merged on 2026-02-06 |
| `claude/remove-prod-lists-perf-KvZSO` | Merged | PR merged on 2026-02-05 |
| `claude/review-marker-tool-improvements-mmIfA` | Merged | PR merged on 2026-02-05 |
| `claude/test-supabase-connection-XcY66` | Merged | PR merged on 2026-02-06 |
| `codex/ensure-supabase-connection-is-working` | Merged | PR merged on 2026-02-06 |
| `codex/summarize-missing-athlete-information` | Merged | PR merged on 2026-02-05 |
| `codex/update-player-schedule-dates` | Merged | PR merged on 2026-02-05 |
| `copilot/fix-thursday-schedule-issues` | Merged | PR merged on 2026-02-05 |
| `copilot/address-review-comments-pr17` | Closed | PR closed without merge |
| `copilot/sub-pr-50` | Closed | PR closed without merge |
| `copilot/sub-pr-50-again` | Closed | PR closed without merge |
| `copilot/sub-pr-50-another-one` | Closed | PR closed without merge |
| `copilot/test-supabase-connection` | Closed | PR closed without merge |

### Orphaned Branches (1 branch)

The following branch exists but has no associated pull request:

| Branch Name | Status | Notes |
|-------------|--------|-------|
| `claude/date-aware-player-checklist-yLrXC` | Orphaned | No associated PR found |

## How to Delete

### Option 1: Using the cleanup script

Run the provided cleanup script:

```bash
./cleanup-branches.sh
```

The script will:
1. List all branches to be deleted
2. Ask for confirmation
3. Delete each branch from the remote repository
4. Provide a summary of results

### Option 2: Manual deletion via GitHub CLI

If you have the GitHub CLI installed:

```bash
# Delete each branch individually
gh api -X DELETE /repos/zachringnight/nextjs-boilerplate/git/refs/heads/claude/add-button-feature-4LGiM
gh api -X DELETE /repos/zachringnight/nextjs-boilerplate/git/refs/heads/claude/add-station-checklist-Y3CV2
# ... (repeat for each branch)
```

### Option 3: Manual deletion via GitHub UI

For each branch:
1. Go to https://github.com/zachringnight/nextjs-boilerplate/branches
2. Find the branch in the list
3. Click the trash icon to delete it

## Protected Branches

The following branches are NOT included in this cleanup:
- `main` - Primary development branch
- `copilot/clean-up-extra-branches` - Current working branch for this cleanup task

## Verification

After running the cleanup, you can verify the branches were deleted by running:

```bash
git ls-remote --heads origin | wc -l
```

Expected result: 2 branches remaining (main + copilot/clean-up-extra-branches)
