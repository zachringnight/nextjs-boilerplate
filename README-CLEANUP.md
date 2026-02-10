# Branch Cleanup - Quick Start Guide

## Immediate Action Required

This PR has identified **21 stale branches** in your repository that should be deleted. Follow one of the methods below to complete the cleanup.

## 🚀 Recommended: Use GitHub Actions (Easiest)

1. Go to the **Actions** tab in your repository
2. Select the **"Cleanup Stale Branches"** workflow from the left sidebar
3. Click the **"Run workflow"** button (top right)
4. Type `DELETE` in the confirmation field
5. Click the green **"Run workflow"** button
6. Wait for the workflow to complete (should take < 1 minute)

## ⚡ Alternative: Use the Bash Script

If you have git push access:

```bash
# Clone the repository (if not already cloned)
git clone https://github.com/zachringnight/nextjs-boilerplate.git
cd nextjs-boilerplate

# Checkout this branch
git checkout copilot/clean-up-extra-branches

# Run the cleanup script
./cleanup-branches.sh
```

## 🐍 Alternative: Use the Python Script

If you prefer Python and have a GitHub token:

```bash
# Install requests library
pip install requests

# Run the script with your GitHub token
python3 cleanup-branches-api.py YOUR_GITHUB_TOKEN
```

Generate a token at: https://github.com/settings/tokens (needs `repo` scope)

## 📋 What Will Be Deleted?

- **15 merged branches** - Associated PRs have been merged to main
- **5 closed branches** - Associated PRs were closed without merging
- **1 orphaned branch** - No associated PR found

See [BRANCH_CLEANUP.md](./BRANCH_CLEANUP.md) for the complete list with details.

## ✅ After Cleanup

After running any of the above methods, verify the cleanup:

```bash
# Check remaining branches
git ls-remote --heads origin
```

Expected: Only `main` and `copilot/clean-up-extra-branches` should remain (until this PR is merged).

## ❓ Questions?

- All scripts are safe - they ask for confirmation before deleting
- Branches can be recovered for ~90 days after deletion if needed
- No local git history or code will be affected
- Only remote branches on GitHub will be deleted

---

**Note**: This PR branch (`copilot/clean-up-extra-branches`) will be automatically deleted after merging, which is expected.
