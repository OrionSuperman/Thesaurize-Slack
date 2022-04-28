// `cp _env .env` then modify it
// See https://github.com/motdotla/dotenv
const config = require("dotenv").config().parsed;
// Overwrite env variables anyways
for (const k in config) {
  process.env[k] = config[k];
}

let agent = undefined;
// If you have HTTP proxy
const httpProxyUrl = process.env.HTTP_PROXY;
if (typeof httpProxyUrl !== 'undefined') {
  const HttpsProxyAgent = require('https-proxy-agent');
  agent = new HttpsProxyAgent(httpProxyUrl);
}

// Enable helpful logging for debugging
const developerMode = true;
const { LogLevel } = require("@slack/logger");
const logLevel = process.env.SLACK_LOG_LEVEL || LogLevel.DEBUG;

// The initialization can be deferred until App#init() call when true
const deferInitialization = true;

const thesaurize = require("thesaurize");

const { App } = require("@slack/bolt");
const app = new App({
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  agent,
  logLevel,
  developerMode,
  deferInitialization,
});

// Request dumper middleware for easier debugging
if (process.env.SLACK_REQUEST_LOG_ENABLED === "1") {
  app.use(async (args) => {
    const copiedArgs = JSON.parse(JSON.stringify(args));
    copiedArgs.context.botToken = 'xoxb-***';
    if (copiedArgs.context.userToken) {
      copiedArgs.context.userToken = 'xoxp-***';
    }
    copiedArgs.client = {};
    copiedArgs.logger = {};
    args.logger.debug(
      "Dumping request data for debugging...\n\n" +
      JSON.stringify(copiedArgs, null, 2) +
      "\n"
    );
    const result = await args.next();
    args.logger.debug("next() call completed");
    return result;
  });
}

// ---------------------------------------------------------------
// Start coding here..
// see https://slack.dev/bolt/

app.command("/thesaurize", async ({ logger, command, ack, say }) => {
  await thesaurizeText({ logger, command, ack, say });
});

// ---------------------------------------------------------------

async function thesaurizeText({ logger, command, ack, say }) {
    try {
      let mutatedText = thesaurize(command.text)
      logger.debug(command);
      await ack();
      await say(`*${command.user_name}*: ${command.text} \n\n *Thesaurize*: ${mutatedText}`);
    } catch (e) {
      logger.error(e);
      await ack(`I done borked`);
    }
  }

(async () => {
  try {
    await app.init();
    await app.start();
    console.log("⚡️ Bolt app is running! ");
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
