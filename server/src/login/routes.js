module.exports = (app, passport) => 
{

  console.log(passport);
  const controller = require("./controller.js");
  var router = require("express").Router();
  let db = require('../db/models/index');

  const { hashPassword } = require("./utils.js");

  router.post("/login", passport.authenticate('local'), (req, res) => {

    console.log('Logged In');
    res.sendStatus(200);
  
  });

  router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {

      //console.log("username:", username);
      //console.log("password:", password);
      
      if(username == null || password == null)
      {
        //Requirement not available
        res.statusMessage = 'password/username invalid';
        res.status(400).end();
        return;
      }
  
      const userDB = await db.users.findOne({ where: { username: username } });
  
      if(userDB) {
      
        res.statusMessage = 'User already exists!';
        res.status(409).end();
      
      } else {
  
        const passwordHashed = hashPassword(password);
        //console.log("passwordHashed:", passwordHashed);
        const newUser = await db.users.create({ username:username, password: passwordHashed });
        res.sendStatus(201);
      
        //console.log('Registered In');
      }
      
      //res.sendStatus(200);

    }
    catch (error)
    {
      console.log(error);
    }

  });

  router.post("/logout", (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
      if (err) return response.sendStatus(400);
      response.send(200);
    });
  });

  router.get("/discord", passport.authenticate('discord'));
  router.get('/discord/redirect', passport.authenticate('discord', {
      failureRedirect: '/'
  }), function(req, res) {

      res.send("<p>You are logged with Discord. You can close the authentification.</p>");

  });

  
  // Set route to start OAuth link, this is where you define scopes to request
  router.get('/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

  // Set route for OAuth redirect
  router.get('/twitch/callback', passport.authenticate('twitch', {
      failureRedirect: '/'
  }), function(req, res) {

      res.send("<p>You are logged with Twitch. You can close the authentification.</p>");

  });

  router.get("/status", (request, response) => {
    console.log("Inside /auth/status endpoint");
    console.log(request.user);

    return request.user ? response.send(request.user) : response.sendStatus(401);
  });

  app.use('/api/v1/auth/', router);

};