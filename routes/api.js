/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');

var CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, (err) => {
  if(err)
    console.log("Couldn't connect to db: " + err);
});

module.exports = function (app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
