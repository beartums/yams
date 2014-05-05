/* 
    rest.js
    mongodb-rest

    Created by Tom de Grunt on 2010-10-03.
    Copyright (c) 2010 Tom de Grunt.
		This file is part of mongodb-rest.
*/ 
var mongo = require("mongodb"),
    app = module.parent.exports.app,
    config = module.parent.exports.config,
    util = require("./util"),
	BSON = mongo.BSONPure;

/**
 * Query
 */
 app.get('/:db?', function(req, res) {

	if (!req.params.db) {
		console.log('no DB name passed');
		var db = new mongo.Db('a', new mongo.Server(config.db.host, config.db.port, {'auto_reconnect':true}));
		var dbAdmin = db.admin();
		adminDb.listDatabases(function(err, dbs) {
			result = {databases:dbs};
			res.header("Content-Type", "application/json");
			res.send(result);
		});
	} else {
	  console.log('Looking up collections in DB: ' + req.params.db);
	  var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect':true}));
	  db.open(function(err,db) {
		db.collectionNames(function(err,items) {
			result = {collections:items};
			res.header("Content-Type", "application/json");
			console.log('sent');
			res.send(result);
		});
	  });
	}
});

app.get('/:db/:collection/:id?', function(req, res) { 
  var query = req.query.query ? JSON.parse(req.query.query) : {};

  // Providing an id overwrites giving a query in the URL
  if (req.params.id) {
    query = {'_id': new BSON.ObjectID(req.params.id)};
  }
  var options = req.params.options || {};

  var test = ['limit','sort','fields','skip','hint','explain','snapshot','timeout'];

  for( o in req.query ) {
    if( test.indexOf(o) >= 0 ) {
      options[o] = req.query[o];
    } 
  }
  
  var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect':true}));
  db.open(function(err,db) {
    //db.authenticate(config.db.username, config.db.password, function () {
	    db.collection(req.params.collection, function(err, collection) {
         collection.find(query, options, function(err, cursor) {
          cursor.toArray(function(err, docs){
            var result = [];          
            if(req.params.id) {
              if(docs.length > 0) {
                result = util.flavorize(docs[0], "out");
                res.header('Content-Type', 'application/json');
                res.send(result);
              } else {
                res.send(404);
              }
            } else {
              docs.forEach(function(doc){
                result.push(util.flavorize(doc, "out"));
              });
              res.header('Content-Type', 'application/json');
              res.send(result);
            }
            db.close();
          });
         });
        });
    //});
  });
});

/**
 * Insert
 */
app.post('/:db/:collection', function(req, res) {
  if(req.body) {
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect':true}));
    db.open(function(err, db) {
      //db.authenticate(config.db.username, config.db.password, function () {
        db.collection(req.params.collection, function(err, collection) {
          // We only support inserting one document at a time
          collection.insert(Array.isArray(req.body) ? req.body[0] : req.body, function(err, docs) {
            res.header('Location', '/'+req.params.db+'/'+req.params.collection+'/'+docs[0]._id.toHexString());
            res.header('Content-Type', 'application/json');
            res.send(docs[0], 201);
            db.close();
          });
        });
      //});
    });
  } else {
    res.header('Content-Type', 'application/json');
    res.send('{"ok":0}',200);
  }
});

/**
 * Update
 */
app.put('/:db/:collection/:id', function(req, res) {
  var spec = {'_id': new BSON.ObjectID(req.params.id)};

  var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect':true}));
  db.open(function(err, db) {
    //db.authenticate(config.db.username, config.db.password, function () {
      db.collection(req.params.collection, function(err, collection) {
        collection.update(spec, req.body, true, function(err, docs) {
          res.header('Content-Type', 'application/json');
          res.send('{"ok":1}');
          db.close();
        });
      });
    //});
  });
});

/**
 * Delete
 */
app.del('/:db/:collection/:id', function(req, res) {
  var spec = {'_id': new BSON.ObjectID(req.params.id)};
 
  var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect':true}));
  db.open(function(err, db) {
    //db.authenticate(config.db.username, config.db.password, function () {
      db.collection(req.params.collection, function(err, collection) {
        collection.remove(spec, function(err, docs) {
          res.header('Content-Type', 'application/json');
          res.send('{"ok":1}');
          db.close();
        });
      });
    //});
  });
});


