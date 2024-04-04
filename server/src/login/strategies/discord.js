const passport = require('passport');
const { Strategy } = require('passport-discord');
const refresh = require('passport-oauth2-refresh');

var scopes = ['identify', 'email', 'guilds', 'guilds.join'];

let db = require('../../db/models/index');

passport.serializeUser((user, done) => {
    console.log("SerializeUserDiscord");
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log("DeserializeUserDiscord");
	try {
		const findUser = await db.users.findByPk(id);
		if (!findUser) throw new Error("User Not Found");
		done(null, findUser);
	} catch (err) {
		done(err, null);
	}
});

var discordStrat = new Strategy(
    {
        clientID: "1224549162054451250",
        clientSecret: "TYClWxUMhcCJ8WgxN3Kkk8LLvtaF4VRH",
        callbackURL: 'http://localhost:3001/api/v1/auth/discord/redirect',
        scope: scopes,
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log("HEY VOICI LE RETOUR DE DISCORD WHOAH");
        console.log(profile);

        profile.refreshToken = refreshToken; //Store this for later refreshes

        let id_discord = profile.id;

        const findUser = await db.discord_authentification.findOne({ where: { id_discord: id_discord } });
        if (!findUser)
        {
            console.log("first connection, going create a new account...");

            const newUser = await db.users.create({ username: profile.username, password: accessToken });
            const discordRow = await db.discord_authentification.create({ id_discord:id_discord, user_id: newUser.id });

            done(null, newUser);
        }
        else
        {
            console.log("account exist, going connected...");
            //findUser.user_id

            const findID = await db.discord_authentification.findOne({ where: { id_discord: profile.id } });
            const getUser = await db.users.findOne({ where: { id: findID.user_id } });
            done(null, getUser);
        }


    }
);


refresh.use(discordStrat);
module.exports = passport.use(discordStrat);