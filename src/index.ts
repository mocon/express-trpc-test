import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'
import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'
import { appRouter as router, createContext } from './trpc'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: false }),
    // Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0,
  profilesSampleRate: 0,
})

// `requestHandler` must be the first middleware on the app
// `tracingHandler` creates a trace for every incoming request
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (req, res) => {
  res.end({ message: 'Hello, World!' })
})

app.get('/debug-sentry', (req, res) => {
  throw new Error('My first Sentry error!')
})

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router,
    createContext,
  }),
)

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

// Optional fallthrough error handler
// The error id is attached to `res.sentry` to be returned
// and optionally displayed to the user for support
app.use(function onError(err, req, res, next) {
  res.statusCode = 500
  res.end(res.sentry + '\n')
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
