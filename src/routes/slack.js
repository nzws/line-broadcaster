const Client = require('@line/bot-sdk').Client;
const axios = require('axios');
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
const client = new Client({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_SECRET
});

app.use(bodyParser.urlencoded({ extended: false }));
app.post('*', async (req, res) => {
  if (!req.body || req.body.token !== process.env.SLACK_TOKEN || !req.body.text) {
    res.status(403).end('ERROR');
    return;
  }

  const text = `<${req.body.user_name}> ${req.body.text}`;

  await client.pushMessage(process.env.LINE_GROUP_ID, {
    type: 'text',
    text: text
  });

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    "attachments": [
      {
        "color": "#36a64f",
        "author_name": req.body.user_name,
        "text": text
      }
    ]
  });

  res.end();
});

app.listen();
