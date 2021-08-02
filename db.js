require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
const {Schema} = mongoose
mongoose.set('useFindAndModify', false)

// for DNS validation
const dns = require('dns');
const options = {
  family: 0,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log("db is connected."))

const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number
  }
})

const Urls = mongoose.model('Url', urlSchema)

// CRUD - Create

const urlValidation = (rawUrl) => {
  let isValid = true

  // dns.lookup is an async function, which leads to return of this function always be true
  // await dns.lookup(rawUrl, options, (err) => {
  //   if (err && err.code == 'ENOTFOUND') {
  //     isValid = false
  //     console.log(isValid)
  //     console.log('haaaa')
  //   }
  // });
  let regex = /http(s)?:\/\/[(www)\.a-zA-Z0-9@:%._\+~#=-]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

  isValid = regex.test(rawUrl)
  
  return isValid
}

const createAndSaveUrl = (rawUrl, done) => {
  let shortUrl = null

  Urls.findOne({})
      .sort({short_url: 'desc'})
      .exec((err, doc) => {
        if (err) return console.log(err)
        if (!doc) {
          shortUrl = 1
        } 
        else {
          shortUrl = doc['short_url'] + 1
        }

        let url = new Urls({original_url: rawUrl, short_url: shortUrl})
        url.save((err, doc) => {
          if (err) return console.log(err)
          done(null, doc)
        })
      })

}
// CRUD - Read
const findShortUrl = (rawUrl, done) => {
  Urls.findOne({original_url: rawUrl})
      .exec((err, doc) => {
        if (err) return console.log(err)
        done(null, doc)
      })
}

const findOriginalUrl = (shortUrl, done) => {
  Urls.findOne({short_url: shortUrl}, (err, doc) => {
    if (err) return console.log(err)

    done(null, doc)
  })
}
// CRUD - Update (not required)

// CRUD - Delete (not required)




exports.findShortUrl = findShortUrl
exports.createShortUrl = createAndSaveUrl
exports.findOriginalUrl = findOriginalUrl
exports.urlValidation = urlValidation