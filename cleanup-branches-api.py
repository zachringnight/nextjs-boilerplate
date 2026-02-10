#!/usr/bin/env python3
"""
Branch cleanup script using GitHub API
Requires: pip install requests
Usage: python3 cleanup-branches-api.py <GITHUB_TOKEN>
"""

import sys
import requests
from typing import List

# Repository information
OWNER = "zachringnight"
REPO = "nextjs-boilerplate"

# Branches to delete
BRANCHES_TO_DELETE = [
    "claude/add-button-feature-4LGiM",
    "claude/add-station-checklist-Y3CV2",
    "claude/clip-edit-delete-features-B2zJ8",
    "claude/date-aware-player-checklist-yLrXC",
    "claude/enhance-clip-marker-szQre",
    "claude/fix-clip-marker-2WKbl",
    "claude/fix-turbopack-lint-Ners8",
    "claude/improve-clip-tracker-RR8W4",
    "claude/polish-player-cards-No5gL",
    "claude/remove-prod-lists-perf-KvZSO",
    "claude/review-marker-tool-improvements-mmIfA",
    "claude/test-supabase-connection-XcY66",
    "codex/ensure-supabase-connection-is-working",
    "codex/summarize-missing-athlete-information",
    "codex/update-player-schedule-dates",
    "copilot/address-review-comments-pr17",
    "copilot/fix-thursday-schedule-issues",
    "copilot/sub-pr-50",
    "copilot/sub-pr-50-again",
    "copilot/sub-pr-50-another-one",
    "copilot/test-supabase-connection",
]


def delete_branch(token: str, branch: str) -> bool:
    """Delete a branch using GitHub API"""
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/refs/heads/{branch}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    response = requests.delete(url, headers=headers)
    return response.status_code == 204


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 cleanup-branches-api.py <GITHUB_TOKEN>")
        print("\nYou can create a token at: https://github.com/settings/tokens")
        print("Required scopes: repo (or public_repo for public repositories)")
        sys.exit(1)
    
    token = sys.argv[1]
    
    print("=" * 50)
    print("Branch Cleanup Script (GitHub API)")
    print("=" * 50)
    print(f"\nRepository: {OWNER}/{REPO}")
    print(f"Branches to delete: {len(BRANCHES_TO_DELETE)}")
    print("\nBranches:")
    for branch in BRANCHES_TO_DELETE:
        print(f"  - {branch}")
    
    response = input("\nProceed with deletion? (y/n): ")
    if response.lower() != 'y':
        print("Aborted.")
        return
    
    print("\nDeleting branches...\n")
    
    deleted = 0
    failed = 0
    
    for branch in BRANCHES_TO_DELETE:
        print(f"Deleting {branch}...", end=" ")
        if delete_branch(token, branch):
            print("✓ deleted")
            deleted += 1
        else:
            print("✗ failed (may already be deleted or you lack permissions)")
            failed += 1
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    print(f"Successfully deleted: {deleted} branches")
    print(f"Failed/Already deleted: {failed} branches")
    print("\nDone!")


if __name__ == "__main__":
    main()
