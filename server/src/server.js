const express = require("express");
const cors = require("cors");
const config = require("./../config.json");
const passport = require("passport");


const app = express();
// Apply CORS settings
app.use(cors(config.cors_options));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(require('express-session')({ secret: config.EXPRESS_SESSION_SECRET, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

/** REGISTER PASSPORT AUTH */
//passport.use(require("./login/strategies/local.js"));

require("./login/strategies/local.js");
require("./login/strategies/discord.js");
require("./login/strategies/twitch.js");

// Add the line below, which you're missing:
//require('./path/to/passport/config/file')(passport);

// simple route
app.get("/", (req, res) => { res.json({ message: "SSO: Welcome to FRVtubers server." }); });

require("./login/routes.js")(app, passport);


(async () => {

  // set port, listen for requests
  const server = app.listen(config.server_port, () => {
    console.log(`Server is running on port ${config.server_port}.`);
  });

  // `server` is a vanilla Node.js HTTP server, so use
  // the same ws upgrade process described here:
  // https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
  server.on('upgrade', (request, socket, head) => {

  });


})().catch(console.error);