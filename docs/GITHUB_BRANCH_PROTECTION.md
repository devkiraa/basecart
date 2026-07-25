# GitHub Branch Protection Policy & Ruleset (U1 Requirement)

This document specifies the required GitHub repository branch protection settings for `main` and `master` production branches.

## Protection Rules for `main` / `master`

1. **Require Pull Request Before Merging**:
   - Require at least **1 approving review** from a code owner before merging.
   - Dismiss stale pull request approvals when new commits are pushed.
   - Require review from Code Owners (`.github/CODEOWNERS`).

2. **Require Status Checks to Pass Before Merging**:
   - Require branch to be up to date before merging.
   - Required status checks:
     - `Validate Backend Worker` (`pr-validation.yml`)
     - `Validate Next.js Frontends Edge-Compilation` (`pr-validation.yml`)
     - `NPM Dependency Vulnerability Audit` (`security-scan.yml`)
     - `CodeQL Static Code Analysis` (`security-scan.yml`)

3. **Require Signed Commits**:
   - Enforce GPG / SSH commit signing for all commits pushed to protected branches.

4. **Restrict Direct Pushes**:
   - Restrict who can push to matching branches: Only automated deployment bots or administrators.
   - Force pushes: **Disabled**.
   - Branch deletions: **Disabled**.

5. **Enforce Rules for Administrators**:
   - Apply all protection rules to repository administrators to prevent unintended direct pushes.
