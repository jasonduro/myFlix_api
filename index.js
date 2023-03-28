const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const bodyParser = require('body-parser');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(bodyParser.urlencoded({
    extended: true
  }));
  
app.use(bodyParser.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

//setup Cross-Origin-Resource-Sharing  
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflix-app-reloaded.netlify.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

//Import auth.js file code
const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//added express validator for server-side input validation
const { check, validationResult } = require('express-validator');
  
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
//commenting out express.static public so that / can lead to basic message
//app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to my super awesome myFlix movie API app-thing-a-bob!');
});

  //READ Function #1 - Return a list of ALL movies to the user
  app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

    //READ Function #2 - Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title
    app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
      Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
          res.status(201).json(movie);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
  }); 
  
  //end point that returns only thriller genre movies IMPORTANT - passport.authenticate('jwt'{ session: false }), REMOVED
  app.get('/movies/genre', (req, res) => {
    Movies.find({ 'Genre.Name' : 'Thriller' })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  //READ Function #3 to return data about a genre by name
  app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
      .then((movies) => {
        res.status(201).json(movies.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  //end point that returns only Jonathan Demme as Director movies
  app.get('/movies/director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ 'Director.Name' : 'Jonathan Demme' })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  //READ Function #4 to return data about a director by name
  app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movies) => {
        res.status(201).json(movies.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

    //READ Function #5 to get all users
    app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
      Users.find()
          .then((users) => {
          res.status(201).json(users);
      })
      .catch((err) => {
          console.error(error);
          res.status(500).send('Error: ' + err);
      });
  });

  //CREATE Function #6 - Allow new users to register
  app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });
  

    // Get Function #7 a user by username - GET Request for specific user based on username
    app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
      Users.findOne({ Username: req.params.Username })
      .then((user) => {
          res.json(user);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
  });

      // UPDATE function #8 - Allow Users to update their info (username, password, email, birthday)
      app.put('/users/:Username', passport.authenticate('jwt', { session: false }), 
      [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
      ], (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
        
        Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
        });
    });

    // UPDATE Function #9 - Allow users to Add a movie to a user's list of favorites
    app.post('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
        $addToSet: { FavoriteMovies: req.params.MovieId }
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
        });
    });

    // DELETE Function #10 - Allow users to Delete a movie from a user's list of favorites
    app.delete('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieId }
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
        });
    });

    // DELETE Function #11 - Allow existing users to deregister
    app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
            } else {
            res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

    const port = process.env.PORT || 8080;
    app.listen(port, '0.0.0.0',() => {
     console.log('Listening on Port ' + port);
    });