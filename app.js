const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { OpenAI } = require('./openai');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Authorization middleware
app.use(function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'authorization header missing' });
  }
  next();
});

app.get('/', async (req, res) => {
  try {
    const { poet, mood, topic } = req.query;
    const { authorization } = req.headers;

    if (!poet || !mood || !topic) {
      res.status(400).end();
      return;
    }

    const openai = new OpenAI(authorization);
    let poem = await openai.generatePoem(poet, mood, topic);
    res.send({ poem: poem.trim() });
  } catch (err) {
    console.log(err.response.data);
    res.status(401).json({
      status: 401,
      error: err.response.data?.error?.code == "invalid_api_key" ? "Invalid OpenAI API Key" : "Something went wrong",
    });
  }

  return;
})


app.listen(PORT, (error) => {
  if (!error)
    console.log("Server is running on " + PORT)
  else
    console.log("Error occurred, server can't start", error);
}
);