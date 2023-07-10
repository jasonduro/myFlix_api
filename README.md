# myFlix_api Project
## OBjective
Built the server-side component of a "movies" web application. The web app provides users with access to information about different movies, directors, and genres. Users can sign up, update their personal information, and create a list of their favorite movies. 
This project was my first introduction to building out the backend of the MERN stack. 
![1  READ all movies from movies collection](https://github.com/jasonduro/myFlix_api/assets/38364361/6317fed8-90d9-421d-9b6e-377af3a77d32)
<img width="1440" alt="1  get all movies" src="https://github.com/jasonduro/myFlix_api/assets/38364361/ef6b6500-dedc-4373-905d-34718f4c66ec">
## Key Learnings from this project: 
* Using Node.js and Express
* REST Architecture
* Middleware Modules - body-parser package and Morgan.
* Relational SQL Database and PostgresSQL
* Non-Relational Database - MongoDB
* Mongoose for business logic
* JSON formatting
* Postman for API Endpoint testing
* User Authentication, localstorage, JWT authentication
* Data Validation Logic
* Data Security regulations
* Deployment to Github
* Deployment to Heroku

## User Stories
* As a user, I want to be able to receive information on movies, directors, and genres so that I can learn more about movies I’ve watched or am interested in.
* As a user, I want to be able to create a profile so I can save data about my favorite movies.

## Feature Requirements
* Return a list of ALL movies to the user
* Return data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
* Return data about a genre (description) by name/title (e.g., “Thriller”)
* Return data about a director (bio, birth year, death year) by name
* Allow new users to register
* Allow users to update their user info (username, password, email, date of birth)
* Allow users to add a movie to their list of favorites
* Allow users to remove a movie from their list of favorites
* Allow existing users to deregister
