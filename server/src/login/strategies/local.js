const passport = require("passport");
const { Strategy } = require("passport-local");
const { comparePassword } = require("../utils");

let db = require('../../db/models/index');

passport.serializeUser((user, done) => {
    console.log("SerializeUser");
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log("DeserializeUser");
	try {
		const findUser = await db.users.findByPk(id);
		if (!findUser) throw new Error("User Not Found");
		done(null, findUser);
	} catch (err) {
		done(err, null);
	}
});

module.exports = passport.use(
    new Strategy(
        async (username, password, done) => {
            console.log(`username: ${username}`);
            console.log(`password: ${password}`);

            try {
                
                const findUser = await db.users.findOne({ where: { username: username } });
                if (!findUser) throw new Error("User not found");
                if (!comparePassword(password, findUser.password))
                    throw new Error("Bad Credentials");
                done(null, findUser);

            } catch(err) {
                done(err, null);
            } 
        }
    )
);