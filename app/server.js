/* eslint-disable import/no-unresolved */
const path = require('path')
const Koa = require('koa')
const favicon = require('koa-favicon')
const compression = require('koa-compress')
const logger = require('koa-logger')

const isProd = process.env.NODE_ENV === 'production'

const rootPath = path.resolve(__dirname, '../')

const resolve = file => path.resolve(rootPath, file)

// create koa instance
const app = new Koa()

const router = require('./router')(app)

// cache static
const serve = (filepath, cache) => require('koa-static')(resolve(filepath), {
  maxage: cache && isProd ? 60 * 60 * 24 * 30 : 0
})

app.use(logger())
app.use(compression({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
app.use(favicon('./public/favicon.ico'))
app.use(serve('public', true))
app.use(serve('dist', true))

app.use(router.routes()).use(router.allowedMethods())

// page not found
app.use((ctx, next) => {
  ctx.type = 'html'
  ctx.body = '404 | Page Not Found'
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`server started at http://127.0.0.1:${port}`)
})
