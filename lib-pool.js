const _ = require('lodash');
const Promise = require('bluebird');
const workerFarm = require('worker-farm')
const workers = workerFarm({
  maxCallsPerWorker: process.env.MAX_CALLS_PER_WORKER || 200,
  maxConcurrentWorkers: process.env.CONCURRENCY || require('os').cpus().length,
  maxConcurrentCallsPerWorker: process.env.MAX_CONCURRENT_CALLS_PER_WORKER || 3,
  maxConcurrentCalls: Infinity,
  maxCallTime: process.env.TIMEOUT || 8000,
  maxRetries: process.env.MAX_RETRIES || 0,
  autoStart: false
}, require.resolve('./lib'), ['screenCallback'])

module.exports.screen = function(data) {

  return new Promise(function(resolve, reject) {
    workers.screenCallback(data, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
  })
}
