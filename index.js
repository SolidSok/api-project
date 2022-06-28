const bodyParser = require('body-parser'),
  express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// logging
app.use(morgan('common', { stream: accessLogStream }));

app.use(bodyParser.json());

// static file
app.use(express.static('public'));

let users = [
  {
    id: 1,
    name: 'Amy',
    favoriteMovies: ['A Silent Voice'],
  },
  {
    id: 2,
    name: 'Bob',
    favoriteMovies: [],
  },
  {
    id: 3,
    name: 'Cessei',
    favoriteMovies: ['Weathering with You', 'Your Name'],
  },
];

let movies = [
  {
    title: 'Weathering with You',
    year: '2019',
    genre: {
      name: 'Drama',
      description: 'Relationships and character development',
    },
    director: {
      name: 'Makoto Shinkai',
      bio: 'Makoto Shinkai was born on February 9, 1973. He is a Japanese animator, fimlmaker, author, and manga artist.',
    },
    img: '',
  },
  {
    title: 'Your Name',
    year: '2016',
    genre: {
      name: 'Drama',
      description: 'Relationships and character development',
    },
    director: {
      name: 'Makoto Shinkai',
      bio: 'Makoto Shinkai was born on February 9, 1973. He is a Japanese animator, fimlmaker, author, and manga artist.',
    },
    img: '',
  },
  {
    title: 'A Silent Voice',
    year: '2016',
    genre: {
      name: 'Drama',
      description: 'Relationships and character development',
    },
    director: {
      name: 'Naoko Yamada',
      bio: 'Naoko Yamada was born no November 28, 1984. She is a Japanese animator, television and film director.',
    },
    img: '',
  },
  {
    title: 'Spirirted Away',
    year: '2001',
    genre: {
      name: 'Fantasy',
      description: 'A world unlike ours',
    },
    director: {
      name: 'Hayao Miyazaki',
      bio: "Hayao Miyazaki, born January 5, 1941, is one of Japan's greatest animation directors.",
    },
    img: '',
  },
  {
    title: 'Summer Wars',
    year: '2009',
    genre: {
      name: 'Drama',
      description: 'Relationships and character development',
    },
    director: {
      name: 'Mamoru Hosoda',
      bio: 'Mamoru Hosoda was born on September 19, 1967. He is a Japanese film director and animator.',
    },
    img: '',
  },
  {
    title: 'Wolf Children',
    year: '2012',
    genre: {
      name: 'Drama',
      description: 'Relationships and character development',
    },
    director: {
      name: 'Mamoru Hosoda',
      bio: 'Mamoru Hosoda was born on September 19, 1967. He is a Japanese film director and animator.',
    },
    img: '',
  },
  {
    title: 'Persona 3 The Movie: #4 Winter of Rebirth',
    year: '2016',
    genre: {
      name: 'Action',
      description: 'Cool and intense scenes',
    },
    director: {
      name: 'Tomohisa Taguchi',
      bio: 'unknown',
    },
    img: '',
  },
  {
    title: "Howl's Moving Castle",
    year: '2004',
    genre: {
      name: 'Adventure',
      description: 'Discovering new things',
    },
    director: {
      name: 'Hayao Miyazaki',
      bio: "Hayao Miyazaki, born January 5, 1941, is one of Japan's greatest animation directors.",
    },
    img: '',
  },
  {
    title: 'Independence Day',
    year: '1996',
    genre: {
      name: 'Sci-Fi',
      description: 'Advanced technology and space',
    },
    director: {
      name: 'Roland Emmerich',
      bio: 'Roland Emmerich was born on November 10, 1955. He is a German film director and producer.',
    },
    img: '',
  },
  {
    title: 'The Dark Knight',
    year: '2008',
    genre: {
      name: 'Action',
      description: 'Cool and intense scenes',
    },
    director: {
      name: 'Christopher Nolan',
      bio: 'Christopher Nolan was born on July 30, 1970 in London, England, UK.',
    },
    img: '',
  },
];

// CREATE new users
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names');
  }
});

// UPDATE user's name
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user');
  }
});

// DELETE remove users
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);
  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user');
  }
});

// CREATE add movies to users' arrays
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
});

// DELETE remove movies from users' arrays
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies.filter((title) => title !== movieTitle);
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
});

// READ default page
app.get('/', (req, res) => {
  res.send("Welcome! You're on the front page!");
});

// READ movies page
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ movies by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});

// READ movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre');
  }
});

// READ movie director
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === directorName
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director');
  }
});

// READ send to documentation
app.get('/documentation', (req, res) => {
  res.sendFile('/public/documentation.html', { root: __dirname });
});

// error handling goes last but before app.listen
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
