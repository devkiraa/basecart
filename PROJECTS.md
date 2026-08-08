# Basecart — GitHub Projects & Roadmap Management

This document outlines how **GitHub Projects (v2)** is integrated into the Basecart monorepo for tracking features, bug fixes, and deployment milestones.

---

## 📋 Project Board Architecture

The project board is organized into 5 primary columns:

| Column | Description | Automation Trigger |
|---|---|---|
| **📋 Backlog** | New feature requests, raw proposals, and non-blocking tasks | Issue created with `project-backlog` label |
| **🎯 Ready / Todo** | Prioritized tasks approved for immediate implementation | Issue labeled `todo` |
| **🚧 In Progress** | Active tasks currently being worked on in local workspace | Branch created / PR opened in draft |
| **👀 In Review / QA** | PR submitted, builds passing, pending final verification | PR opened for review |
| **✅ Done** | Merged into `master` and verified through Vitest integration suite | PR merged to `master` |

---

## ⚡ GitHub Actions Automation

Basecart automatically Syncs Issues & Pull Requests with GitHub Projects via [project-automation.yml](file:///.github/workflows/project-automation.yml):

1. **Auto-Add to Board**: Every new Issue or PR is automatically added to the project board.
2. **Issue Templates**: Pre-configured issue templates for [Feature Requests](file:///.github/ISSUE_TEMPLATE/feature_request.md) and [Bug Reports](file:///.github/ISSUE_TEMPLATE/bug_report.md).
3. **Automated Status Progression**: Merging a PR into `master` automatically moves associated issue cards to **Done**.

---

## 🚀 Active Project Milestones

- [x] Cloudflare Worker & Durable Object Backend Migration
- [x] Real Instagram Media & Reel Importer with Catalog Tagging
- [x] Storefront UI Layout Polish & Responsiveness (1280px Grid)
- [x] Storefront Studio Theme Customizer with Non-Product Image Asset Uploader
- [ ] Real WhatsApp Business API Integration
- [ ] Real Shiprocket Logistics API Credentials & Tracking
- [ ] Production Deployment to Cloudflare Pages & Cloudflare Workers Account
