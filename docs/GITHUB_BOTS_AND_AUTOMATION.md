# Basecart Automated GitHub Security Bots & Bug Finders Guide

This document outlines the free GitHub Actions bots, security scanners, and GitHub native apps configured to automatically detect bugs, security vulnerabilities, leaked secrets, and outdated dependencies.

---

## 🤖 Active GitHub Action Bots in `.github/workflows`

| Bot / Workflow | Config File | Function |
| :--- | :--- | :--- |
| **CodeQL Security Scanner** | `.github/workflows/security-scan.yml` | Free SAST engine by GitHub that scans code for SQL injection, XSS, CSRF, insecure cryptography, and type safety bugs. |
| **Dependabot Security Updates** | `.github/dependabot.yml` | Automatically scans `npm` dependencies weekly and opens Pull Requests to patch vulnerable libraries. |
| **Secret Leak Detection Bot** | `.github/workflows/secret-leak-bot.yml` | Uses `Gitleaks` to scan every commit and PR for exposed API keys, JWT secrets, AWS tokens, or private keys. |
| **Automated Bug & Quality Scanner** | `.github/workflows/code-quality-bot.yml` | Runs multi-package TypeScript type checking (`npx tsc --noEmit`), ESLint checks, and `vitest` unit tests on every PR. |
| **Stale Maintenance Bot** | `.github/workflows/stale-bot.yml` | Automatically manages inactive issues and PRs using GitHub's `actions/stale`. |

---

## 🔒 Free GitHub Native Security Apps (Enable in GitHub Web UI)

In addition to GitHub Actions workflows, enable these **100% free native GitHub security features** under your repository settings (**Settings -> Code security and analysis**):

1. **Dependabot Alerts**:
   - Sends real-time notifications when a vulnerable npm dependency is detected.
2. **Dependabot Security Updates**:
   - Automatically submits pull requests containing minor/patch dependency upgrades.
3. **Secret Scanning**:
   - GitHub natively checks pushed code against known secret patterns (e.g. AWS, Stripe, Razorpay, Slack, OpenAI tokens).
4. **Code Scanning (CodeQL UI Integration)**:
   - Displays static analysis security warnings directly in the GitHub PR review UI.

---

## 🛠️ Recommended Free GitHub Marketplace Apps & Bots

You can also install these free 1-click GitHub Marketplace Apps for your repository:

1. **Snyk Security Bot** (Free Tier):
   - Scans code and dependencies for vulnerabilities and provides automated fix suggestions.
   - [Install Snyk GitHub App](https://github.com/marketplace/snyk)
2. **Codecov / Coveralls Bot** (Free for Open Source & Developer Public Repos):
   - Posts automated code coverage report comments on PRs.
   - [Install Codecov GitHub App](https://github.com/marketplace/codecov)
3. **Restyled / Prettier Bot** (Free):
   - Automatically formats code and opens PRs for code formatting consistency.
   - [Install Restyled GitHub App](https://github.com/marketplace/restyled-io)
