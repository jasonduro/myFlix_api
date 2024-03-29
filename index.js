require('dotenv').config();

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
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflix-app-reloaded.netlify.app', 'http://localhost:4200', 'https://myflix-app-reloaded.netlify.app/', 'https://myflix-app-reloaded.netlify.app/movies', 'https://myflix-app-reloaded.netlify.app/profile', 'https://myflix-app-reloaded.netlify.app/director', 'https://myflix-app-reloaded.netlify.app/genre', 'https://myflix-app-reloaded.netlify.app/login', 'https://myflix-app-reloaded.netlify.app/register', 'https://myflix-app-reloaded.netlify.app/users', 'https://myflix-app-reloaded.netlify.app/users/:username', 'https://myflix-app-reloaded.netlify.app/users/:username/favorites', 'https://myflix-app-reloaded.netlify.app/users/:username/movies/:movieID', 'https://myflix-app-reloaded.netlify.app/users/:username/movies/:movieID/delete', 'https://myflix-app-reloaded.netlify.app/users/:username/update', 'https://myflix-app-reloaded.netlify.app/users/:username/delete', 'https://myflix-app-jl.herokuapp.com/movies', 'http://localhost:4200/movies' ];

app.use(cors({
  origin: '*',
 /*  
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  } */
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
  res.json({ message: 'Welcome to my super awesome myFlix movie API app-thing-a-bob!'});
});

/**
 * Gets a list of all movies.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
  app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error: ' + err });
  }); 
});

/**
 * Gets a specific movie by title.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
    app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
      Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
          res.status(201).json(movie);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).json({ message: 'Error: ' + err });
      });
  }); 
  
/**
 * Gets all movies in the Thriller genre.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
  app.get('/movies/genre', (req, res) => {
    Movies.find({ 'Genre.Name' : 'Thriller' })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err });
    });
  });

/**
 * Gets data about a genre by its name.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
  app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
      .then((movies) => {
        res.status(201).json(movies.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error: ' + err });
      });
  });
  
/**
 * Gets all movies by director Jonathan Demme.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
  app.get('/movies/director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ 'Director.Name' : 'Jonathan Demme' })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err });
    });
  });

/**
 * Gets data about a director by their name.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
  app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movies) => {
        res.status(201).json(movies.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error: ' + err });
      });
  });

/**
 * Gets all users.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
    app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
      Users.find()
          .then((users) => {
          res.status(201).json(users);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).json({ message: 'Error: ' + err });
      });
  });


/**
 * Registers a new user.
 *
 * @param {express.Request} req - The request object containing the user details.
 * @param {express.Response} res - The response object.
 */
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
          return res.status(400).json({ message: req.body.Username + ' already exists' });
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
              res.status(500).json({ message: 'Error: ' + error });
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: 'Error: ' + error });
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
          res.status(500).json({ message: 'Error: ' + err });
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
            res.status(500).json({ message: 'Error: ' + err });
        } else {
            res.json(updatedUser);
        }
        });
    });

/*     app.get('/users/:Username/favoriteMovies', passport.authenticate('jwt', { session: false }), (req, res) => {
      Users.findOne({ Username: req.params.Username })
      .populate('FavoriteMovies') // This populates the FavoriteMovies field with actual movie documents, instead of just the IDs.
      .exec((err, user) => {
          if (err) {
              console.error(err);
              res.status(500).json({ message: 'Error: ' + err });
          } else {
              res.json(user.FavoriteMovies);
          }
      });
  });
 */
    // UPDATE Function #9 - Allow users to Add a movie to a user's list of favorites
    app.post('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
        $addToSet: { FavoriteMovies: req.params.MovieId }
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error: ' + err });
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
            res.status(500).json({ message: 'Error: ' + err });
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
            res.status(400).json({ message: req.params.Username + ' was not found'});
            } else {
            res.status(200).json({ message: req.params.Username + ' was deleted.'});
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Error: ' + err });
        });
    });

    const port = process.env.PORT || 8080;
    app.listen(port, '0.0.0.0',() => {
     console.log('Listening on Port ' + port);
    });
