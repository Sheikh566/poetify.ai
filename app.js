const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('./openai');
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get('/api', async (req, res) => {
  try {
    const { poet, mood, topic } = req.query;
    const { authorization } = req.headers;

    if (!req.headers.authorization) {
      return res.status(403).json({ error: 'authorization header missing' });
    }

    if (!poet || !mood || !topic) {
      return res.status(400).json({ error: 'One of the query param is missing' });
    }

    const openai = new OpenAI(authorization);
    let poem = await openai.generatePoem(poet, mood, topic);
    res.send({ poem: poem.trim() });
  } catch (err) {
    console.log(err.response.data);
    res.status(401).json({
      status: 401,
      error: err.response.data.error.code == "invalid_api_key" ? "Invalid OpenAI API Key" : "Something went wrong",
    });
  }

  return;
})

// Serve web app
app.use(express.static(path.join(__dirname, 'poetify-web', 'public')));

// Catch-all route for the Svelte app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'poetify-web', 'public', 'index.html'));
});

app.listen(PORT, (error) => {
  if (!error)
    console.log("Server is running on " + PORT)
  else
    console.log("Error occurred, server can't start", error);
}
);