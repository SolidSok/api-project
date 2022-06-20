const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
const topMovies = [
  { title: 'Weathering with You', year: '2019' },
  { title: 'Your Name', year: '2016' },
  { title: 'A Silent Voice', year: '2016' },
  { title: 'Spirirted Away', year: '2009' },
  { title: 'Summer Wars', year: '2009' },
  { title: 'Wolf Children', year: '2012' },
  { title: 'The Lion King', year: '1994' },
  { title: 'Persona 3 The Movie: #4 Winter of Rebirth', year: '2016' },
  { title: 'Mulan', year: '1998' },
  { title: "Howl's Moving Castle", year: '2004' },
];

app.use(morgan('common', { stream: accessLogStream }));

// defualt page
app.get('/', (req, res) => {
  res.send("Welcome! You're on the front page!");
});

// movies page
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/documentation', (req, res) => {
  res.sendFile('/public/documentation.html', { root: __dirname });
});

// static file
app.use(express.static('public'));

// error handling goes last but before app.listen
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
