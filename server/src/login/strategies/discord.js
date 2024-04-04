const passport = require('passport');
const { Strategy } = require('passport-discord');

var scopes = ['identify', 'email', 'guilds', 'guilds.join'];

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const findUser = await DiscordUser.findById(id);
		return findUser ? done(null, findUser) : done(null, null);
	} catch (err) {
		done(err, null);
	}
});

export default passport.use(
    new Strategy(
        {
            clientID: "1224549162054451250",
            clientSecret: "TYClWxUMhcCJ8WgxN3Kkk8LLvtaF4VRH",
            callbackURL: 'http://localhost:3001/api/v1/auth/discord/redirect',
            scope: scopes,
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(accessToken, refreshToken);
            console.log(profile);
        }
    )
);