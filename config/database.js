const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const { MONGO_URI } = process.env;

exports.connect = () => {
  // Connecting to the database
  const url = 'mongodb://127.0.0.1:27017';
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) {
      return console.log(err);
    }
    console.log(`MongoDB Connected: ${url}`);
  });

  mongoose.Promise = global.Promise;

};

