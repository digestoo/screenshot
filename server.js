const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const lib = require('./lib')

app.get('/:domain', async (req, res) => {

  try {
    var data = await lib.screen(req.params.domain)
    res.json(data)
  } catch (e) {
    res.status(500).json({})
  }
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
