# Screenshot

Simple microservice which is making screenshot for a given url and returns an image url from google storage

### Run API 

```bash
git clone git@github.com:digestoo/screenshot.git
cd screenshot
npm install
PORT=3000 npm start
```

### Docker

```bash
docker pull cigolpl/screenshot
docker run -it -p 3000:3000 cigolpl/screenshot
```

### Environment variables

- `PORT`
- `PROJECT_ID`
- `BUCKET_NAME`

## Making requests

```bash
curl -XGET -H "Content-Type: application/json" http://localhost:3000/<domain>
```

URL params:

- `domain`

## License

MIT

