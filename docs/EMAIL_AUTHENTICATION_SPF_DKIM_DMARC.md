# Basecart Email Authentication Configuration: SPF, DKIM & DMARC (W1 Requirement)

This document defines the mandatory DNS record configurations for `basecart.app` transactional email deliverability and anti-spoofing protection.

---

## 1. SPF (Sender Policy Framework)

Add TXT record to authorize ZeptoMail / Amazon SES / SendGrid to send emails on behalf of `@basecart.app`:

- **Host/Name**: `@` or `basecart.app`
- **Type**: `TXT`
- **Value**: `v=spf1 include:zeptomail.net include:amazonses.com ~all`

---

## 2. DKIM (DomainKeys Identified Mail)

Configure 2048-bit DKIM selector records provided by your transactional mail provider (ZeptoMail / SES):

- **Host/Name**: `zeptomail._domainkey.basecart.app`
- **Type**: `TXT`
- **Value**: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE...`

---

## 3. DMARC (Domain-based Message Authentication, Reporting & Conformance)

Enforce strict DMARC compliance policy with automated aggregate report delivery:

- **Host/Name**: `_dmarc.basecart.app`
- **Type**: `TXT`
- **Value**: `v=DMARC1; p=reject; rua=mailto:dmarc-reports@basecart.app; ruf=mailto:dmarc-forensics@basecart.app; pct=100; adkim=s; aspf=s`

---

## 4. Verification Procedures

To verify DNS propagation and email authentication status:

```bash
# Check SPF
dig TXT basecart.app +short

# Check DKIM
dig TXT zeptomail._domainkey.basecart.app +short

# Check DMARC
dig TXT _dmarc.basecart.app +short
```
