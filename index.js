const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');

const bodyParser = require('body-parser');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let movies = [
    {
        title: 'Harry Potter and the Sorcerer\'s Stone',
        author: 'J.K. Rowling'
    },
    {
        title: 'Lord of the Rings',
        author: 'J.R.R. Tolkien'
    },
    {
        title: 'Twilight',
        author: 'Stephanie Meyer'
    },
    {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling'
    },
    {
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien'
    },
    {
    title: 'Twilight',
    author: 'Stephanie Meyer'
    },
    {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling'
    },
    {
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien'
    },
    {
    title: 'Twilight',
    author: 'Stephanie Meyer'
    }
  ];

app.use(bodyParser.urlencoded({
    extended: true
  }));
  
  app.use(bodyParser.json());


  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
// using express to access the public folder documentation html file


app.get('/', (req, res) => {
  res.send('Welcome to my super awesome myFlix movie API app-thing-a-bob!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.get('/movies', (req, res) => {
    res.send(movies)
})

app.use(express.static('public'));

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
