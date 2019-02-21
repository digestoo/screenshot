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

//exports.saveScreen = function(domain, url) {
exports.saveScreen = function(data) {

  var new_name = (data.url || data.domain) + '-' + data.random;
  console.log('new_name: ' + new_name)
  return new Promise(function(resolve, reject) {
    const pageres = new Pageres({
      delay: 1,
      filename: '<%= url %>',
      timeout: 20
    })
    .src(new_name, [WIDTH + 'x' + HEIGHT], {crop: true})
    //.src(url || domain, [WIDTH + 'x' + HEIGHT], {crop: false})
    .dest(__dirname + DIR)
    .run()
    .then(function(val) {
      var output = __dirname + DIR + '/' + new_name + '.png';
      console.log('Local image: ' + output);
      return resolve(output);
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

//exports.upload = async function(domain) {
exports.upload = async function(data) {

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

exports.screen = async function(domain, url) {

  var random = 'abbccddd';
  var path = await exports.saveScreen({
    domain, url, random
  })

  console.log('path');
  console.log(path);
  var result = await exports.resize(path);
  console.log('resize');
  //console.log(result);
  var image_url = await exports.upload({
    domain, random
  });
  console.log('image url');
  console.log(image_url);

  return {
    image: image_url
  };
}
