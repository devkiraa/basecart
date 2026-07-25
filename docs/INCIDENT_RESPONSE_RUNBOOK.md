# Basecart Security & Operational Incident Response Runbook (Y1 Requirement)

## 1. Incident Classification & Severity Levels

| Severity | Definition | Target Resolution SLA |
| :--- | :--- | :--- |
| **SEV-1 (Critical)** | Active data breach, platform outage, compromised secret/private key, or unauthorized access to control DB. | < 1 hour |
| **SEV-2 (High)** | Degradation of core checkout flows, Razorpay webhook failures, or failing auth rate limiters. | < 4 hours |
| **SEV-3 (Medium)** | Non-critical feature bug, single-tenant UI glitch, or non-blocking API latency. | < 24 hours |

---

## 2. Immediate Triage & Containment Protocols

### A. Compromised Credentials or API Keys
1. **Rotate Compromised Secret**:
   - Immediately update binding secret via Wrangler:
     ```bash
     npx wrangler secret put JWT_SECRET --remote
     npx wrangler secret put ENCRYPTION_SECRET --remote
     npx wrangler secret put RAZORPAY_SECRET --remote
     ```
2. **Invalidate Active Sessions**:
   - Purge all refresh tokens in D1 control database:
     ```sql
     DELETE FROM refresh_tokens;
     ```

### B. DDoS or Brute-Force Auth Attack
1. **Enable Cloudflare Under Attack Mode**:
   - Navigate to Cloudflare Dashboard -> Security -> Settings -> Set security level to "I'm Under Attack!".
2. **IP Rate Limit Enforcement**:
   - Rate limiters will return HTTP 429 automatically (`authRateLimiterMiddleware`).
   - Add malicious IP ranges to Cloudflare WAF blocklist.

### C. Database Corruption or Ransomware Recovery
1. **Trigger D1 Restoration Procedure**:
   - Execute Point-In-Time Restoration script:
     ```bash
     npx ts-node packages/backend/src/scripts/d1_backup_restore.ts restore basecart-control-db ./backups/latest.sql --remote
     ```

---

## 3. Communication & Escalation Matrix

- **Incident Lead Contact**: `security@basecart.app` / `+91-9895000000`
- **Customer Status Page**: `https://status.basecart.app`
- **Post-Mortem**: Document root cause within 48 hours of resolution.
