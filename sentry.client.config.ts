import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://21ddf9b54bd3cdcdc049cd195f1ecc4a@o4511364629921792.ingest.de.sentry.io/4511364680777808",
  tracesSampleRate: 0.2,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
});
