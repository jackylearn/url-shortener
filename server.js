require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const findShortUrl = require('./db.js').findShortUrl
const createShortUrl = require('./db.js').createShortUrl
const urlValidation = require('./db.js').urlValidation
// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  let rawUrl = req.body['url']
  console.log(rawUrl)
  let respond = null
  if (!urlValidation(rawUrl)) {
    res.json({error: 'invalid url'})
    return
  }

  findShortUrl(rawUrl, (err, doc) => {
    if (err) return console.log(err)

    if (!doc) {
      createShortUrl(rawUrl, (err, doc) => {
        if (err) return console.log(err)
        respond = {original_url: doc['original_url'], short_url: doc['short_url']}
        res.json(respond)
      })
      return
    }
    respond = {original_url: doc['original_url'], short_url: doc['short_url']}
    res.json(respond)
  })
});


const findOriginalUrl = require('./db.js').findOriginalUrl
app.get('/api/shorturl/:shorturl', (req, res) => {
  let shortUrl = parseInt(req.params.shorturl)
  findOriginalUrl(shortUrl, (err, doc) => {
    if (err) return console.log(err)
    res.redirect(doc['original_url'])
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
