# Security

## Secrets

OpenAI and Qloo credentials are server-side secrets. Do not commit `.env`, `.env.local`, deployment credentials, or API keys.

Before publishing a commit, you can run:

```bash
git grep -n -I -E "sk-proj-|OPENAI_API_KEY=sk-|QLOO_API_KEY=.+"
```

If a secret is ever committed or exposed publicly, rotate it immediately at the provider and remove it from the Git history as appropriate.

## Client boundary

Do not rename secret environment variables with a `NEXT_PUBLIC_` prefix. Next.js may expose such values to browser code.

## Reporting a vulnerability

Please avoid posting secrets or exploit details in a public issue. Use GitHub private vulnerability reporting if it is enabled for this repository, or contact the maintainer privately.
