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
  if (err)
    console.log("Couldn't connect to db: " + err);
});

//Models
const Board = require('../models/Board');
const Thread = require('../models/Thread');
const Reply = require('../models/Reply');

function createThreadAndSaveToBoard(threadText, delete_password, board) {
  Thread.create({
    text: threadText,
    delete_password: delete_password,
    parentBoard: board._id
  }, (err, createdThread) => {
    if (err)
      return err;
    board.threads.push(createdThread._id);
    board.save();
  });
};


module.exports = function (app) {

  app.route('/api/threads/:board')
    .post((req, res) => {
      const boardName = req.params.board;
      const threadText = req.body.text;
      const threadDeletePassword = req.body.delete_password;

      if (threadText == null)
        return res.status(400).send("Thread text is required");

      if (threadDeletePassword == null)
        return res.status(400).send("Thread delete_password is required");

      Board.findOne({
        name: boardName
      }, (err, foundBoard) => {
        if (err)
          return res.status(400).send(err);

        if (!foundBoard) {
          Board.create({
            name: boardName
          }, (err, createdBoard) => {
            if (err)
              return res.status(400).send(err);

            const onSaveThreadPotentialError = createThreadAndSaveToBoard(threadText, threadDeletePassword, createdBoard);
            if (onSaveThreadPotentialError)
              return res.status(400).send(err);

            res.redirect("/b/" + boardName);
          });
        } else {
          const onSaveThreadPotentialError = createThreadAndSaveToBoard(threadText, threadDeletePassword, foundBoard);
          if (onSaveThreadPotentialError)
            return res.status(400).send(err);

          res.redirect("/b/" + boardName);
        }
      });
    });

  app.route('/api/replies/:board')
    .post((req, res) => {
      const boardName = req.params.board;
      const replyText = req.body.text;
      const replyDeletePasswrod = req.body.delete_password;
      const thread_id = req.body.thread_id;

      Board.findOne({
        name: boardName
      }).populate("threads").exec((err, foundBoard) => {
        if (err)
          return res.status(400).send(err);

        if (!foundBoard)
          return res.status(400).send("Specified board was not found");

        const foundThread = foundBoard.threads.filter(thread => {
          return thread._id == thread_id;
        })[0];

        if(!foundThread)
          return res.status(400).send("Thread with given id was not found");

        Reply.create({text: replyText, delete_password: replyDeletePasswrod, parentThread: foundBoard._id}, (err, createdReply) => {
          if (err)
            return res.status(400).send(err);
          if(!createdReply)
            return res.status(400).send('Could not create Reply');

          foundThread.replies.push(createdReply._id);
          foundThread.bumped_on = createdReply.created_on;
          foundThread.save();

          res.redirect("/b/" + boardName + "/" + thread_id);
        }); 
      });
    });

    app.route("/api/threads/:board")
    .get((req, res) => {
      const boardName = req.params.board;

      Board.findOne({
        name: boardName
      }).populate("threads").exec((err, foundBoard) => {
        if (err)
          return res.status(400).send(err);

        if (!foundBoard)
          return res.status(400).send("Specified board was not found");

        Thread.find({parentBoard: foundBoard._id}).sort("-bumped_on").limit(10).populate("replies").exec((err, recentThreads) => {

          recentThreads = recentThreads.map(thread => {
            if(thread.replies != null) {
              thread.replies = thread.replies.sort((a, b) => {
                return new Date(b.created_on) - new Date(a.created_on);
              }).filter((reply, index) => {
                return index < 3;
              });
            }

            thread.delete_password = undefined;
            thread.reported = undefined;
            thread.parentBoard = undefined;
            thread.__v = undefined;

            return thread;
          });

          

          res.send(recentThreads);
        });
      });
    });
}