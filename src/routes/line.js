const express = require('express');
const axios = require('axios');
const middleware = require('@line/bot-sdk').middleware;
const Client = require('@line/bot-sdk').Client;
const JSONParseError = require('@line/bot-sdk').JSONParseError;
const SignatureValidationFailed = require('@line/bot-sdk').SignatureValidationFailed;

const app = express();
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_SECRET
};
const client = new Client(config);

app.use(middleware(config));

app.post('*', async (req, res) => {
  for (let event of req.body.events) {
    if (
      event.type !== 'message' ||
      event.source.groupId !== process.env.LINE_GROUP_ID ||
      event.message.type !== 'text'
    ) {
      return;
    }

    const profile = await client.getGroupMemberProfile(event.source.groupId, event.source.userId);

    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      "attachments": [
        {
          "color": "#36a64f",
          "author_name": profile.displayName,
          "author_icon": profile.pictureUrl,
          "text": event.message.text
        }
      ]
    });
  }

  res.end();
});

app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature);
    return
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw);
    return
  }
  next(err);
});

app.listen();
