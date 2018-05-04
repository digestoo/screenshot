const Pageres = require('pageres');
const DIR = '/temp';
const Promise = require('bluebird');
const resize = require('im-resize');
const WIDTH = '1280';
const HEIGHT = '1024';
const Storage = require('@google-cloud/storage');

const QUALITY = process.env.QUALITY || 80;
const BUCKET_NAME = process.env.BUCKET_NAME;
const PROJECT_ID = process.env.PROJECT_ID;
const KEY_FILENAME = process.env.KEY_FILENAME;
const SUFFIX = '-thumb1';

const storage = new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILENAME
});

exports.saveScreen = function(domain, url) {

  var new_name = domain;
  return new Promise(function(resolve, reject) {
    const pageres = new Pageres({
      delay: 1,
      filename: '<%= url %>',
      timeout: 20
    })
    .src(url || domain, [WIDTH + 'x' + HEIGHT], {crop: true})
    //.src(url || domain, [WIDTH + 'x' + HEIGHT], {crop: false})
    .dest(__dirname + DIR)
    .run()
    .then(function(val) {
      return resolve(__dirname + DIR + '/' + new_name + '.png');
    })
    .catch(function (err) {
      return reject(err)
    });
  })
}

exports.resize = function(path) {

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

exports.upload = async function(domain) {

  var bucketName = BUCKET_NAME;
  var filename = '.' + DIR + '/' + domain + SUFFIX + '.png';

  console.log('filename');
  console.log(filename);

  await storage
    .bucket(bucketName)
    .upload(filename)
    .then(res => {
      //console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  filename = domain + SUFFIX + '.png';

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

  return 'https://storage.cloud.google.com/' + BUCKET_NAME + '/' + domain + SUFFIX + '.png';
}

exports.screen = async function(domain, url) {

  var path = await exports.saveScreen(domain, url)
  console.log('path');
  console.log(path);
  var result = await exports.resize(path);
  console.log('resize');
  //console.log(result);
  var image_url = await exports.upload(domain);
  console.log('image url');
  console.log(image_url);

  return {
    image: image_url
  };
}
