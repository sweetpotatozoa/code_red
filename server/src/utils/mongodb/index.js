const Sentry = require('@sentry/node')
const { MongoClient } = require('mongodb')
const configs = require('../configs')

class Client {
  constructor(dbConfigs) {
    this.connectPromiseEntries = {}
    this.clients = {}
    this.configs = dbConfigs

    try {
      for (const [clusterAlias, clusterConfig] of Object.entries(dbConfigs)) {
        console.log(
          `Connecting to DB '${clusterAlias}' with uri: ${clusterConfig.uri}`,
        )

        this._register(
          clusterAlias,
          clusterConfig.uri,
          clusterConfig.options,
          clusterConfig.required,
        )
      }
    } catch (e) {
      console.error(e)
      Sentry.captureException(e)
    }
  }

  _register(clusterAlias, uri, options = {}, required = true) {
    const client = new MongoClient(uri, { ...options })
    this.clients[clusterAlias] = client

    const p = client
      .connect()
      .then((client) => {
        console.log(`Connected to DB '${clusterAlias}'`)
        return clusterAlias
      })
      .catch((err) => {
        if (required) {
          console.error(
            `CRITICAL: Failed to connect to DB '${clusterAlias}' with error ${err}`,
          )
        } else {
          console.warn(
            `Failed to connect to DB '${clusterAlias}' with error ${err}`,
          )
        }
        Sentry.captureException(err, (scope) => {
          scope.setTransactionName(`Register MongoDB ${clusterAlias}`)
          return scope
        })

        this.clients[clusterAlias] = null

        setTimeout(() => {
          this._register(clusterAlias, uri, options, required)
        }, 5000)

        return null
      })

    this.connectPromiseEntries[clusterAlias] = { connectPromise: p, required }
  }

  runAfterAllConnected(cb, onlyRequired = true) {
    const promises = Object.values(this.connectPromiseEntries)
      .filter((entry) => !onlyRequired || entry.required)
      .map((entry) => entry.connectPromise)

    Promise.all(promises).then((names) => {
      cb(names)
    })
  }

  _getDb(clusterAlias) {
    const client = this.clients[clusterAlias]

    if (!client || client.s.hasBeenClosed) {
      console.log(
        `DB '${clusterAlias}' is not connected. Trying to reconnect...`,
      )
      const clusterConfig = this.configs[clusterAlias]
      this._register(
        clusterAlias,
        clusterConfig.uri,
        clusterConfig.options,
        clusterConfig.required,
      )

      const err = new Error(`DB '${clusterAlias}' is not connected`)
      throw err
    }
    return client.db()
  }

  // example
  get mainDb() {
    return this._getDb('main')
  }
}

const dbConfigs = {
  // example
  main: {
    uri: encodeURI(configs.mainDbUri),
    options: {
      maxIdleTimeMS: 30000,
    },
  },
}

const client = new Client(dbConfigs)

client.runAfterAllConnected((names) => {
  console.log(`Required DBs are connected: [${names}]`)
}, true)

module.exports = client
