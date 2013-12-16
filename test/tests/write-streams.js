var mbstream = require('multibuffer-stream')
var buff = require('multibuffer')
var bops = require('bops')
var concat = require('concat-stream')
var os = require('os')
var crypto = require('crypto')

module.exports.singleNdjsonObject = function(test, common) {
  test('piping a single ndjson object into a write stream', function(t) {
    common.getDat(t, function(dat, done) {

      var ws = dat.createWriteStream({ json: true })
    
      ws.on('close', function() {
    
        var cat = dat.createReadStream()
    
        cat.pipe(concat(function(data) {
          t.equal(data.length, 1)
          t.equal(data[0].batman, "bruce wayne")
          done()
        }))
      })
    
      ws.write(bops.from(JSON.stringify({"batman": "bruce wayne"})))
      ws.end()
    })
  })
}

module.exports.singleNdjsonString = function(test, common) {
  test('piping a single ndjson string into a write stream', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ json: true })
    
      ws.on('close', function() {
    
        var cat = dat.createReadStream()
      
        cat.pipe(concat(function(data) {
          t.equal(data.length, 1)
          t.equal(data[0].batman, "bruce wayne")
          done()
        }))
      
      })
    
      ws.write(JSON.stringify({"batman": "bruce wayne"}))
      ws.end()
    })
  })
}

module.exports.multipleNdjsonObjects = function(test, common) {
  test('piping multiple ndjson objects into a write stream', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ json: true })
    
      ws.on('close', function() {
      
        var cat = dat.createReadStream()
      
        cat.pipe(concat(function(data) {
          t.equal(data.length, 2)
          t.equal(data[0].foo, "bar")
          t.equal(data[1].foo, "baz")
          done()
        }))
      
      })
    
      ws.write(bops.from(JSON.stringify({"foo": "bar"}) + os.EOL))
      ws.write(bops.from(JSON.stringify({"foo": "baz"})))
      ws.end()
    
    })
  })
}


module.exports.singleNdjsonObjectIdOnly = function(test, common) {
  test('piping a single ndjson object w/ only _id into a write stream', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ json: true })
    
      ws.on('close', function() {
        var cat = dat.createReadStream()
        cat.pipe(concat(function(data) {
          t.equal(data.length, 1)
          t.equal(data[0]._id, "foo")
          done()
        }))
      })
    
      ws.write(bops.from(JSON.stringify({"_id": "foo"})))
      ws.end()
    })
  })
}

module.exports.singleBuff = function(test, common) {
  test('piping a single row of buff data with write stream', function(t) {
  
    var row = buff.pack([bops.from('bar')])
  
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ columns: ['foo'] })
    
      ws.on('close', function() {
        dat.createReadStream().pipe(concat(function(data) {
          t.equal(data.length, 1)
          t.equal(data[0].foo, 'bar')
          done()
        }))
      })
    
      var packStream = mbstream.packStream()
      packStream.pipe(ws)
      packStream.write(row)
      packStream.end()
    
    })
  })
}

module.exports.multipleBuffs = function(test, common) {
  test('piping multiple rows of buff data with write stream', function(t) {

    var row1 = buff.pack([bops.from('1'), bops.from('2')])
    var row2 = buff.pack([bops.from('3'), bops.from('4')])

    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ columns: ['a', 'b'] })
      ws.on('close', function() {
        dat.createReadStream().pipe(concat(function(data) {
          t.equal(data.length, 2)
          t.equal(data[0].a, '1')
          t.equal(data[0].b, '2')
          t.equal(data[1].a, '3')
          t.equal(data[1].b, '4')
          done()
        }))
      })
    
      var packStream = mbstream.packStream()
      packStream.pipe(ws)
      packStream.write(row1)
      packStream.write(row2)
      packStream.end()
    
    })
  })
}

module.exports.csvOneRow = function(test, common) {
  test('piping a csv with 1 row into a write stream', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ csv: true })
    
      ws.on('close', function() {
        var cat = dat.createReadStream()
        cat.pipe(concat(function(data) {
          t.equal(data.length, 1)
          t.equal(data[0].a, '1')
          t.equal(data[0].b, '2')
          t.equal(data[0].c, '3')
          done()
        }))
      })
    
      ws.write(bops.from('a,b,c\n1,2,3'))
      ws.end()
    
    })
  })
}

module.exports.csvMultipleRows = function(test, common) {
  test('piping a csv with multiple rows into a write stream', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ csv: true })
    
      ws.on('close', function() {
        var cat = dat.createReadStream()
        cat.pipe(concat(function(data) {
          t.equal(data.length, 2)
          t.equal(data[0].a, '1')
          t.equal(data[0].b, '2')
          t.equal(data[0].c, '3')
          t.equal(data[1].a, '4')
          t.equal(data[1].b, '5')
          t.equal(data[1].c, '6')
          done()
        }))
      })
    
      ws.write(bops.from('a,b,c\n1,2,3\n4,5,6'))
      ws.end()
    
    })
  })
}

module.exports.multipleWriteStreams = function(test, common) {
  test('multiple writeStreams, updating rows', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ csv: true })
    
      ws.on('close', function() {
        var cat = dat.createReadStream()
        cat.pipe(concat(function(data) {
          var jws = dat.createWriteStream({ json: true })
          jws.on('close', function() {
            var cat = dat.createReadStream()
            cat.pipe(concat(function(data2) {
              t.equal(data.length, data2.length)
              done()
            }))
          })
          jws.write(bops.from(JSON.stringify(data[0]) + os.EOL))
          jws.write(bops.from(JSON.stringify(data[1])))
          jws.end()
        }))
      })
    
      ws.write(bops.from('a,b,c\n1,2,3\n4,5,6'))
      ws.end()
    
    })
  })
}

module.exports.multipleWriteStreamsUpdatingChanged = function(test, common) {
  test('multiple writeStreams w/ updating data + primary key only updates rows that changed', function(t) {
    common.getDat(t, function(dat, done) {
      var ws1 = dat.createWriteStream({ json: true, primary: 'foo' })
  
      ws1.on('close', function() {
        var ws2 = dat.createWriteStream({ json: true, primary: 'foo' })

        ws2.on('close', function() {
          var cat = dat.createReadStream()
  
          cat.pipe(concat(function(data) {
            t.equal(data.length, 1)
            t.equal(data[0].foo, "bar")
            done()
          }))
        })
    
        ws2.write(bops.from(JSON.stringify({"foo": "bar"})))
        ws2.end()
      })
  
      ws1.write(bops.from(JSON.stringify({"foo": "bar"})))
      ws1.end()
  
    })
  })
}

module.exports.multipleCSVWriteStreamsChangingSchemas = function(test, common) {
  test('multiple CSV writeStreams w/ different schemas', function(t) {
    common.getDat(t, function(dat, done) {
      var ws1 = dat.createWriteStream({ csv: true })
  
      ws1.on('close', function() {
        var ws2 = dat.createWriteStream({ csv: true })

        ws2.on('close', function() {
          var cat = dat.createReadStream()
  
          cat.pipe(concat(function(data) {
            t.equal(data.length, 1)
            t.equal(data[0].foo, "bar")
            done()
          }))
        })
    
        ws2.write(bops.from('d,e,f\nfoo,bar,baz'))
        ws2.end()
      })
  
      ws1.write(bops.from('a,b,c\n1,2,3\n4,5,6'))
      ws1.end()
  
    })
  })
}

module.exports.compositePrimaryKey = function(test, common) {
  test('composite primary key', function(t) {
    common.getDat(t, function(dat, done) {
      var ws = dat.createWriteStream({ objects: true, primary: ['a', 'b'] })
    
      ws.on('close', function() {
        dat.get('foobar', function(err, data) {
          t.false(err, 'no error')
          t.equal(data.c, "hello")
          done()
        })
      })
    
      ws.write({"a": "foo", "b": "bar", "c": "hello"})
      ws.end()
    })
  })
}

module.exports.compositePrimaryKeyCustomSeparator = function(test, common) {
  test('composite primary key w/ custom keySeparator', function(t) {
    common.getDat(t, function(dat, done) {
      var ws = dat.createWriteStream({ objects: true, primary: ['a', 'b'], separator: '@' })
    
      ws.on('close', function() {
        dat.get('foo@bar', function(err, data) {
          t.false(err, 'no error')
          t.equal(data.c, "hello")
          done()
        })
      })
    
      ws.write({"a": "foo", "b": "bar", "c": "hello"})
      ws.end()
    })
  })
  
}

module.exports.compositePrimaryKeyHashing = function(test, common) {
  test('composite primary key w/ composite hashing enabled', function(t) {
    common.getDat(t, function(dat, done) {
      var ws = dat.createWriteStream({ objects: true, primary: ['a', 'b'], hash: true })
    
      ws.on('close', function() {
        var key = crypto.createHash('md5').update('foobar').digest("hex")

        dat.get(key, function(err, data) {
          t.false(err, 'no error')
          t.equal(data.c, "hello")
          done()
        })
      })
    
      ws.write({"a": "foo", "b": "bar", "c": "hello"})
      ws.end()
    })
  })
}

module.exports.writeStreamCsvNoHeaderRow = function(test, common) {
  test('csv writeStream w/ headerRow false', function(t) {
    common.getDat(t, function(dat, done) {
    
      var ws = dat.createWriteStream({ csv: true, columns: ['foo'], headerRow: false })
    
      ws.on('close', function() {
        var cat = dat.createReadStream()
        cat.pipe(concat(function(data) {
          t.equal(data.length, 1)
          t.equal(data[0].foo, 'bar')
          done()
        }))
      })
    
      ws.write(bops.from('bar'))
      ws.end()
    
    })
  })
}

module.exports.writeStreamMultipleWithRandomIds = function(test, common) {
  test('writeStream same json multiple times (random id generation)', function(t) {
    common.getDat(t, function(dat, done) {
      var ws1 = dat.createWriteStream({ json: true })
    
      ws1.on('close', function() {
        var ws2 = dat.createWriteStream({ json: true })
      
        ws2.on('close', function() {
          var cat = dat.createReadStream()
    
          cat.pipe(concat(function(data) {
            t.equal(data.length, 2)
            t.equal(data[0].foo, "bar")
            t.equal(data[1].foo, "bar")
            done()
          }))
        })
      
        ws2.write(bops.from(JSON.stringify({"foo": "bar"})))
        ws2.end()
      })
    
      ws1.write(bops.from(JSON.stringify({"foo": "bar"})))
      ws1.end()
    
    })
  })
}

module.exports.all = function (test, common) {
  module.exports.singleNdjsonObject(test, common)
  module.exports.singleNdjsonString(test, common)
  module.exports.multipleNdjsonObjects(test, common)
  module.exports.singleNdjsonObjectIdOnly(test, common)
  module.exports.singleBuff(test, common)
  module.exports.multipleBuffs(test, common)
  module.exports.csvOneRow(test, common)
  module.exports.csvMultipleRows(test, common)
  module.exports.multipleWriteStreams(test, common)
  module.exports.multipleWriteStreamsUpdatingChanged(test, common)
  module.exports.multipleCSVWriteStreamsChangingSchemas(test, common)
  module.exports.compositePrimaryKey(test, common)
  module.exports.compositePrimaryKeyCustomSeparator(test, common)
  module.exports.compositePrimaryKeyHashing(test, common)
  module.exports.writeStreamCsvNoHeaderRow(test, common)
  module.exports.writeStreamMultipleWithRandomIds(test, common)
}
