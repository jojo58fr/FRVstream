var passport       = require("passport");
var twitchStrategy = require("passport-twitch").Strategy;

const { clientID, secretID } = require('../../../../config-twitch.json');

passport.use(new twitchStrategy({
    clientID: clientID,
    clientSecret: secretID,
    callbackURL: "http://127.0.0.1:3000/auth/twitch/callback",
    scope: "user_read"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ twitchId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));