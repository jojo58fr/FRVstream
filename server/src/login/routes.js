module.exports = (app, passport) => {
    console.log(passport);
    const controller = require("./controller.js");
    var router = require("express").Router();
  
    router.post("/login", passport.authenticate('local'), (req, res) => {
      console.log('Logged In');
      res.send(200);
    });

    router.post("/register", async (request, response) => {
      const { email } = request.body;

      const userDB = await User.findOne({ email });
      if(userDB) {
        response.status.send({ msg: 'User already exists!' });
      } else {
        const password = hashPassword(request.body.password);
        console.log(password);
        const newUser = await User.create({ username, password, email });
        response.send(201);
      }
      console.log('Logged In');
      res.send(200);
    });

    router.get("/discord", passport.authenticate('discord'));
    router.get("/discord/redirect", passport.authenticate('discord'));
  
    router.get("/twitch", passport.authenticate('twitch'));
    router.get("/twitch/callback", passport.authenticate('twitch'));

    router.get("/status", (request, response) => {
      console.log("Inside /auth/status endpoint");
      console.log(request.user);

      return request.user ? response.send(request.user) : response.sendStatus(401);
    });

    app.use('/api/v1/auth/', router);
  };