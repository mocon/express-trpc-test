import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'
import dotenv from 'dotenv'
import { appRouter as router, createContext } from './trpc'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

app.get('/', (req, res) => {
  res.send({ message: 'Hello, World!' })
})

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router,
    createContext,
  }),
)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
