// db.js

const mongoose = require('mongoose');

let dbConnection;

module.exports = {
  connectToDb: async (cb) => {
    try {
        // Use your actual MongoDB URI for development and production
        const uri = "mongodb+srv://romankhromishin:test1234@cluster0.a60ndgf.mongodb.net/" // Replace with your actual connection string
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        dbConnection = mongoose.connection;
      return cb();
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  },
  getDb: () => dbConnection,
};

  