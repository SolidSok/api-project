const bodyParser = require('body-parser'),
  express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.connect('mongodb://localhost:27017/sokFlixDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://localhost:4200',
  'https://m.media.amazon.com',
  'https://sokflix.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin. ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
app.use(morgan('common', { stream: accessLogStream }));

/**
 * Serves static content for the app from the 'public' directory
 */
// static file
app.use(express.static('public'));

// READ send to documentation
app.get(
  '/documentation',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.sendFile('/public/documentation.html', { root: __dirname });
  }
);

/**
 * GET: Returns welcome message fro '/' request URL
 * @returns Welcome message
 */
// READ default page
app.get('/', (req, res) => {
  res.send("Welcome! You're on the front page!");
});

/**
 * GET: returns a list of ALL movies to the user
 * Request body: Bearer Token
 * @returns array of movie objects
 * @ requires passport
 */
// Get all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then(movies => {
        res.status(201).json(movies);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * GET: Returns data (description, genre, director, image URL, whether it's featured or not) about a single movie by title to the user
 * REquest body: Bearer token
 * @param Title (of movie)
 * @returns movie object
 * @requires passport
 */
// READ movies by title
app.get(
  '/movies/:title',

  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then(movie => {
        res.json(movie);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * GET: Returns data about a genre (description) by name/title (e.g., "Fantasy")
 * Request body: Bearer token
 * @param Name (of genre)
 * @returns genre object
 * @requires passport
 */
// READ movies by genre
app.get(
  '/genre/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find({ 'Genre.Name': req.params.name })
      .then(genre => {
        res.json(genre);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * GET: Returns data about a director (bio, birth year) by name
 * Request body: Bearer token
 * @param Name (of director)
 * @returns director object
 * @requires passport
 */
// READ movies by director
app.get(
  '/directors/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find({ 'Director.Name': req.params.name })
      .then(director => {
        res.json(director);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// get list of directors
app.get(
  '/directors',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Directors.find()
      .then(directors => {
        res.json(directors);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//get genre page
app.get(
  '/genres',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Genres.find()
      .then(genres => {
        res.json(genres);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then(users => {
        res.status(201).json(users);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * GET: Returns data on a single user (user object) by username
 * Request body: Bearer token
 * @param Username
 * @returns user object
 * @requires passport
 */
// Get a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * POST: Allow new users to register, Username password & Email are required fields!
 * Request body: Bearer token, JSON with user information
 * @returns user object
 */
// Create New User
app.post(
  '/users',
  [
    check(
      'Username',
      'Username is required with at least 5 characters'
    ).isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then(user => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then(user => {
              res.status(201).json(user);
            })
            .catch(error => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error ' + error);
      });
  }
);

/**
 * POST: Allows users to add a movie to their list of favorities
 * Request body: Bearer token
 * @param username
 * @param movieId
 * @returns user object
 * @requires passport
 */
// Add a movie to a user's list of favorites
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * PUT: Allow users to update their user info (find by username)
 * Request body: Bearer token, updated user info
 * @param Username
 * @returns user object with updates
 * @requires passport
 */
// Update a user's info, by username
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE: Allows existing users to deregister
 * Request body: Bearer token
 * @param Username
 * @returns success message
 * @requires passport
 */
// Delete a user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * DELETE: Allows users to remove a movie from their list of favorites
 * Request body: Bearer token
 * @param Username
 * @param movieId
 * @returns user object
 * @requires passport
 */
// DELETE remove movies from users' arrays
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// error handling goes last but before app.listen
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
