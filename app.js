const { App } = require("@slack/bolt");
require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketmode:true,
  appToken: process.env.APP_TOKEN,
  developerMode: true,
  deferInitialization: true,
});

app.command("/thesaurize", async ({command, ack, say}) => {
    try {
        await ack();
        say("Yay, the command came to my command.")
    } catch (error) {
        console.log("err");
        console.error(error);
    }
})

(async () => {
    try{
        const port = 3000
        // Start your app
        await app.init();
        await app.start(process.env.PORT || port);
        console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
    } catch(error){
        console.log(error)
        process.exit(1)
    }
  
})();