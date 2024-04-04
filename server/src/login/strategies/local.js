import passport from "passport";
import { Strategy } from "passport-local";

import { comparePassword } from "../utils";

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const findUser = await User.findById(id);
		if (!findUser) throw new Error("User Not Found");
		done(null, findUser);
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
        async (username, password, done) => {
            console.log(`username: ${username}`);
            console.log(`password: ${password}`);

            try {
                
                const findUser = await User.findOne({ username });
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