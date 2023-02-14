const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflix', { useNewUrlParser: true, useUnifiedTopology: true });

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

//Import auth.js file code
const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
  
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

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
  
  //end point that returns only thriller genre movies
  app.get('/movies/genre', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  app.post('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
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
      app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
