require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./model/user");
const Loan = require("./model/loan");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, PUT, DELETE, PATCH, GET');
    return res.status(200).json({})
  }

  next();
})

app.post("/register", async (req, res) => {
  try {
    // Get user input

    console.log(req.body);
    const { names, phone, email, password } = req.body;

    // Validate user input
    if (!(email && password && names && phone)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(400).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      names,
      phone,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      'secret key',
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        'secret key',
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.post("/apply-loan", async (req, res) => {
  try {
    // Get loan input
    const { loan_type, amount, payment_period } = req.body;

    // Validate loan input
    if (!(loan_type && amount && payment_period)) {
      res.status(400).send("All input is required");
    }
    // Create loan in our database
    const loan = await Loan.create({
      _id: mongoose.Types.ObjectId(),
      loan_type,
      amount,
      payment_period,
    });

    // return new loan
    res.status(201).json(loan);
  } catch (err) {
    console.log(err);
  }
});

app.get("/get-my-loans", (req, res, next) => {
  Loan.find()
    .select("loan_type amount payment_period _id")
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        loans: docs.map(doc => {
          return {
            _id: doc._id,
            loan_type: doc.loan_type,
            amount: doc.amount,
            payment_period: doc.payment_period

          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome to eclectics");
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
