// Dummy values for env vars that third-party SDKs validate at construction
// time (e.g. `new Resend(...)`), so importing modules under test doesn't
// crash in an environment where the real secret isn't configured.
process.env.RESEND_API_KEY ??= 're_test_dummy_key';
