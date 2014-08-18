# dat.json config file

You can use the `dat.json` file to configure various things about how dat will run.

```json
{
  // metadata properties generated by dat init, you can also add any other properties you want
  "name": "my-dataset", // displayed in dat-editor app
  "publisher": "max ogden",
  "description": "playing around with dat",
  
  "hooks": {
    "listen": "./importer.js", // runs the ./importer.js module when the dat server starts up
  },
  
  "transformations": {
    "put": "transform-uppercase", // runs data through transform-uppercase command before put
    "get": "transform-lowercase" // runs data through transform-lowercase after get
  },
  
  "remotes": {
    "origin": "http://foo.com:6461" // lets you do 'dat pull origin'
  },
  
  "blobs": "google-drive-blobs", // blob store backend module to use
  
  "replicator": "dat-torrent-replicator", // replicator backend module to use
  
  "leveldown": "sqldown", // leveldown backend module to use
  
  "skim": true, // should dat run in 'skim blobs' mode
  
  "port": 9000, // default port for dat listen
  
  "adminUser": "foo", // HTTP admin username
  "adminPass": "bar" // HTTP admin pass
}
```

## metadata properties

you can use any non-reserved keys in dat.json to store whatever kinds of metadata you want. [This issue](https://github.com/dataprotocols/dataprotocols/issues/110) is a discussion about adopting a metadata standard in case you are interested.

## hooks

Right now the only hook is `listen`, which is executed whenever the dat server binds to a port. A dat listen hook is useful for making sure some operation is running whenever dat is running.

A dat listen hook currently must be a Node module in the following form:

```js
module.exports = function hook(dat, done) {
  // do stuff with dat
  
  // must call done when the hook is done initializing, even if you call it immediately
  done()
}
```

Your hook function will get called with `dat, done`, where `dat` is a fully initialized dat instance. You *must* call `done` when your hook is done initializing.

The [dat-npm](https://github.com/mafintosh/dat-npm#readme) importer is a good example of a dat listen hook.

## blobs, replicator, leveldown

These properties are for overriding the default backends that dat uses for I/O. The value must be a relative path to a module or a module name in the current node module scope.