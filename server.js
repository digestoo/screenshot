const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const lib = require('./lib')
//const lib = require('./lib-pool')

app.get('/:domain', async (req, res) => {

  console.log(req.params.domain)

  if (req.params.domain === 'favicon.ico') {
    return res.status(200).json({});
  }

  try {
    var data = await lib.screen({
      domain: req.params.domain
    })
    res.json(data)
  } catch (e) {
    console.log(e.message)
    res.status(500).json({})
  }
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
