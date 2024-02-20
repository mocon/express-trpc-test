import { initTRPC } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { z } from 'zod'

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({})

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router

export const publicProcedure = t.procedure

// App router
export const appRouter = router({
  hello: publicProcedure.input(z.string()).query((opts) => {
    opts.input
    return { message: `Hello, ${opts.input}!` }
  }),
})

export type AppRouter = typeof appRouter
