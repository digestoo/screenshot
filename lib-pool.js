const _ = require('lodash');
const Promise = require('bluebird');
const workerFarm = require('worker-farm')
const workers = workerFarm({
  maxCallsPerWorker: 200,
  maxConcurrentWorkers: process.env.CONCURRENCY || require('os').cpus().length,
  maxConcurrentCallsPerWorker: 3,
  maxConcurrentCalls: Infinity,
  maxCallTime: process.env.TIMEOUT || 8000,
  maxRetries: 0,
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
