var passport = require("passport");
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const { clientID, secretID } = require('../../../../config-twitch.json');

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': clientID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser((user, done) => {
  console.log("SerializeUserTwitch");
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("DeserializeUserTwitch");
try {
  const findUser = await db.users.findByPk(id);
  if (!findUser) throw new Error("User Not Found");
  done(null, findUser);
} catch (err) {
  done(err, null);
}
});

module.exports = passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: clientID,
    clientSecret: secretID,
    callbackURL: "http://127.0.0.1:3000/auth/twitch/callback",
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    console.log(profile);
    done(null, profile);
  }
));