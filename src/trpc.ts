import { initTRPC, TRPCError } from '@trpc/server'
import * as Sentry from '@sentry/node'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { z } from 'zod'

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({})

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router

export const middleware = t.middleware

// Sentry
const sentryMiddleware = middleware(
  Sentry.Handlers.trpcMiddleware({ attachRpcInput: true }) as any,
)

export const publicProcedure = t.procedure.use(sentryMiddleware)

// App router
export const appRouter = router({
  hello: publicProcedure.input(z.string()).query((opts) => {
    opts.input
    return { message: `Hello, ${opts.input}!` }
  }),
  debugSentryTrpc: publicProcedure.input(z.string()).query(() => {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred, please try again.',
      // cause: theError,
    })
  }),
})

export type AppRouter = typeof appRouter
