#!/bin/bash

# Branch Cleanup Script
# This script deletes stale branches that have been merged or closed
# Generated on: 2026-02-10

set -e

echo "=========================================="
echo "Branch Cleanup Script"
echo "=========================================="
echo ""
echo "This script will delete 21 stale branches from the remote repository."
echo "These branches are associated with closed or merged pull requests."
echo ""
echo "Branches to be deleted:"
echo ""

# Array of branches to delete
branches_to_delete=(
  "claude/add-button-feature-4LGiM"
  "claude/add-station-checklist-Y3CV2"
  "claude/clip-edit-delete-features-B2zJ8"
  "claude/date-aware-player-checklist-yLrXC"
  "claude/enhance-clip-marker-szQre"
  "claude/fix-clip-marker-2WKbl"
  "claude/fix-turbopack-lint-Ners8"
  "claude/improve-clip-tracker-RR8W4"
  "claude/polish-player-cards-No5gL"
  "claude/remove-prod-lists-perf-KvZSO"
  "claude/review-marker-tool-improvements-mmIfA"
  "claude/test-supabase-connection-XcY66"
  "codex/ensure-supabase-connection-is-working"
  "codex/summarize-missing-athlete-information"
  "codex/update-player-schedule-dates"
  "copilot/address-review-comments-pr17"
  "copilot/fix-thursday-schedule-issues"
  "copilot/sub-pr-50"
  "copilot/sub-pr-50-again"
  "copilot/sub-pr-50-another-one"
  "copilot/test-supabase-connection"
)

# Print all branches
for branch in "${branches_to_delete[@]}"; do
  echo "  - $branch"
done

echo ""
read -p "Do you want to proceed with deletion? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "Deleting branches..."
echo ""

# Delete each branch
deleted_count=0
failed_count=0

for branch in "${branches_to_delete[@]}"; do
  echo -n "Deleting $branch... "
  if git push origin --delete "$branch" 2>/dev/null; then
    echo "✓ deleted"
    ((deleted_count++))
  else
    echo "✗ failed (may already be deleted)"
    ((failed_count++))
  fi
done

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Successfully deleted: $deleted_count branches"
echo "Failed/Already deleted: $failed_count branches"
echo ""
echo "Done!"
