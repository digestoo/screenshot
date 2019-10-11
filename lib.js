const Pageres = require('pageres');
const DIR = '/temp';
const Promise = require('bluebird');
const resize = require('im-resize');
const WIDTH = '1280';
const HEIGHT = '1024';
const Storage = require('@google-cloud/storage');
const randomstring = require('randomstring');
const moment = require('moment');
const QUALITY = process.env.QUALITY || 80;
const BUCKET_NAME = process.env.BUCKET_NAME;
const PROJECT_ID = process.env.PROJECT_ID;
const KEY_FILENAME = process.env.KEY_FILENAME;
const SUFFIX = '-thumb1';

const storage = new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILENAME
});

//exports.saveScreen = function(domain, url) {
module.exports.saveScreen = function(data) {

  var new_name = (data.url || data.domain) + '-' + data.random;
  console.log('new_name: ' + new_name)
  return new Promise(function(resolve, reject) {
    const pageres = new Pageres({
      delay: process.env.DELAY || 1,
      userAgent: process.env.USER_AGENT,
      filename: `<%= url %>-${data.random}`,
      timeout: 60
    })
    .src(data.url || 'http://' + data.domain, [WIDTH + 'x' + HEIGHT], {crop: true})
    //.src(url || domain, [WIDTH + 'x' + HEIGHT], {crop: false})
    .dest(__dirname + DIR)
    .run()
    .then(function(val) {
      var output = __dirname + DIR + '/' + new_name + '.png';
      console.log('Local image: ' + output);
      return resolve(output);
    })
    .catch(function (err) {
      console.log(err.message)
      return reject(err)
    });
  })
}

module.exports.resize = function(path) {

  var image = {
    path: path,
    width: WIDTH,
    height: HEIGHT
  };

  var output = {
    quality: QUALITY,
    versions: [{
      maxWidth: 400,
      aspect: '4:3',
      format: 'png',
      suffix: SUFFIX
    }]
  };

  return new Promise(function(resolve, reject) {

    resize(image, output, function(error, versions) {

      if (error) {
        return reject(error);
      }

      return resolve(versions);
    });
  })
}

module.exports.upload = async function(data) {

  var bucketName = BUCKET_NAME;
  var last_part = data.domain + '-' + data.random + SUFFIX + '.png';
  var filename = '.' + DIR + '/' + last_part;

  console.log('filename');
  console.log(filename);

  await storage
    .bucket(bucketName)
    .upload(filename)
    .then(res => {
        //console.log(JSON.stringify(res, null, 2));
      console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  filename = last_part;

  console.log('filename');
  console.log(filename);

  await storage
    .bucket(bucketName)
    .file(filename)
    .makePublic()
    .then(res => {
      //console.log(`gs://${bucketName}/${filename} is now public.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  return 'https://storage.googleapis.com/' + BUCKET_NAME + '/' + last_part;
}

module.exports.screen = async function(data) {

  var random = randomstring.generate({
    length: 8,
    charset: 'hex'
  }) + '-' + moment().format('MM-YYYY');

  var path = await module.exports.saveScreen({
    domain: data.domain,
    url: data.url,
    random: random
  })

  console.log('path');
  console.log(path);
  var result = await module.exports.resize(path);
  console.log('resize');
  //console.log(result);
  var image_url = await module.exports.upload({
    domain: data.domain,
    random: random
  });
  console.log('image url');
  console.log(image_url);

  return {
    image: image_url
  };
}

module.exports.screenCallback = function(data, callback) {

  //return module.exports.screenAsync(data).asCallback(callback);
  return module.exports.screen(data).then(res => {
    callback(null, res)
  }).catch(err => {
    callback(err)
  });
}