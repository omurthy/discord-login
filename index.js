const express = require('express');
const app = express();
const passport = require('passport');
const path = require('path');
const {Strategy} = require('passport-discord');
const session = require('express-session');
const { features } = require('process');


app.use(express.static('public'));
app.use(express.static('images'));
app.use(express.static('css'));
passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((obj,done)=>{
    done(null,obj);
});

let strategy = new Strategy({
    clientID : "555667632582295553",
    clientSecret : "SwDOosdPSZyJmk_VDOgbR2Z4Q6HkCmBv",
    callbackURL : "http://localhost:3000/callback",
    scope : ["guilds","identify"], 
},(accessToken,refreshToken,profile,done)=>{
    process.nextTick(()=>done(null,profile));
});
 
 
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, '/index.html'));
    });
    app.get('/fail', function(req, res) {
        res.sendFile(path.join(__dirname, '/fail.html'));
    });
passport.use(strategy);

app.use(session({
    secret: "secret",
    resave : false,
    saveUninitialized : false,
}));

app.use(passport.initialize()); 
app.use(passport.session());
app.get("/login",passport.authenticate("discord",{
    scope :["guilds","identify"],

})); 
app.get("/callback",passport.authenticate("discord",{
    failuredRedirect :"/fail",   
}),(req,res)=>{
    res.redirect("/home");
});

app.get('/home', function(req, res) {
    if(req.user===undefined ) res.redirect('/login');

//console.log(req.user);
//console.log(accessToken);
var name = req.user.username
console.log(name); 
res.sendFile(path.join(__dirname, '/home.html'));
});


app.get('/token', async ({ query }, response) => {
	const { code } = query;

	if (code) {
		try {
			const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `http://localhost:3000/callback`,
					scope: ['identify',"guilds"]
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await oauthResult.json();

			const userResult = await fetch('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${oauthData.token_type} ${oauthData.access_token}`,
				},
			});

			console.log(await userResult.json());
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error;
			// it will return a 401 Unauthorized response in the try block above
			console.error(error);
		}
	}

	return response.sendFile('index.html', { root: '.' });
});


const listener = app.listen(3000,(err)=>{
    if(err) throw err;
    console.log(`Page is ready on port : ${listener.address().port}`);

    
}); 