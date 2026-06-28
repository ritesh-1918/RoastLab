# Security Policy

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: ritesh@gratiantechnologies.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

Response time: within 48 hours. Fix timeline: 7 days for critical, 30 days for others.

## Scope

In scope:
- Authentication bypass
- Data exposure (other users' audit results)
- XSS in audit output rendering
- SSRF via URL input
- Admin panel unauthorized access

Out of scope:
- Rate limiting abuse
- Clickjacking on public pages
- Self-XSS
- Issues requiring physical device access
