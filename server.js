

// I I I I I I I    IMPORTS   I I I I I I I 
import express from "express";


// This will get the book.js file where we get all the different routes
import { BookRouter } from "./routes/api/book.js";

// This will call in the user.js file using its route called UserRouter
import { UserRouter } from "./routes/api/user.js";




// dotenv DEBUGGER    create a new .env file and add   DEBUG=app:*
import * as dotenv from "dotenv";
dotenv.config();


// ccc COOKIES ccc //
// This imports the cookie parser that allows us to write code to allow to check cookies to make sessions
import cookieParser from "cookie-parser";

// This is the tokens that is assigned to a user when successfully logged in


// THIS IS GLOBAL MIDDLEWARE THAT ALLOWS US TO USE req.auth to make sure users cant access site if not logged in
import { authMiddleware } from "@merlin4/express-auth"
// ccc COOKIES ccc //


import debug from "debug";
//Create a debug channel called Server
const debugServer = debug("app:Server");



// ASDASD THIS IS NEEDED TO ALLOW FRONT END ACCESS TO THE BACKEND ASDASD //
import cors from "cors";


// I I I I I I I    IMPORTS   I I I I I I I //




// Declares our express app
const app = express();


// mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm MIDDLEWARE mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm // 

//MIDDLEWARE THAT allows form data from a users input to UPDATE a book by _id   .use is global
app.use(express.urlencoded({extended: true}));


// ccc COOKIES ccc //
// Allows us to actually create cookies
app.use(cookieParser());


// Reads from our cookie and if the user is authenticated it will put the users info inside the cookie
// This is a middleware that will VALIDATE AND CHECK/look inside our created cookie and generate a req.auth and place the token in their
app.use(authMiddleware(process.env.JWT_SECRET, 'authToken',
    {
    httpOnly: true,
    maxAge: 1000*60*60
    }
));
// ccc COOKIES ccc //



/* ffffffffffffffff FOR FRONT END ffffffffffffffff 
    1. npm i cors
    2. import cors from "cors";

    / Add this into the middleware ABOVE my routers in server.js   This --> app.use("/api/books", BookRouter);
    3 app.use(cors());

    / THIS ACCEPTS JSON DATA IN THE BODY OF THE REQUEST FROM THE CLIENT ADD UNDER  app.use(cors());
    4. app.use(express.json()); 
*/

// asdasd THIS IS NEEDED TO ALLOW FRONT END ACCESS TO THE BACKEND asdasd //
app.use(cors(
  {
  origin: "http://localhost:5173",
  credentials: true
  }
)); // cors is making sure the front end domain and the backend domain are compatible

// asdasd THIS ACCEPTS JSON DATA IN THE BODY OF THE REQUEST FROM THE CLIENT
app.use(express.json()); 

/* ffffffffffffffff FOR FRONT END ffffffffffffffff */



// THIS CALLS IN OUR ROUTER SO we can see all of those routes by adding  http://localhost3000/api 
app.use("/api/books", BookRouter);

// THIS CALLS IN OUR ROUTER SO we can see all of those routes by adding  http://localhost3000/api 
app.use("/api/users", UserRouter)


// mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm MIDDLEWARE mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm // 




// --------------------- ERROR HANDLING ---------------------
// Handles ROUTE NOT FOUND Errors when route entered is not valid
app.use((req, res) => {                            // shows the url user typed
  res.status(404).json({error:`Sorry Couldn't Find ${req.originalUrl}`});
});


// Handles Sever Exceptions to keep my server from crashing
app.use((err, req, res, next) => {
  //debugServer(err.stack);
  res.status(err.status).json({Sever_Error: err.message});
});
// --------------------- ERROR HANDLING ---------------------








///////////////// ROUTES //////////////////


// Default route    // res is responding back to the server so our message shows in browser
app.get("/", (req, res) => {
  res.send("Hello Old School Amazon");
  debugServer("Hello From The upgraded console.log()!");
});




/* // SEEING ALL BOOKS
//Making a route to see all the books    to see books type    http://localhost:3000/books
app.get("/books", (req, res) => {
  res.json(books); // calling our array of books
});
*/




/* SEARCHING BOOK
//!!!!!!!!!!!!!!!!!!  SEARCHING BY _id //!!!!!!!!!!!!!!!!!!   http://localhost:3000/books/(_id of book)
// Making another route Getting a book by their _id
app.get("/books/:id", (req, res) => {   // the :id   makes a param variable that we pass in
  const id = req.params.id;  // were are getting a request with the parameters a user puts for the .id
  
  // for every bookID return true when our _id is == to the id user enters
  const getBookID = books.find(bookID => bookID._id == id)

  // If users id == book show that book
  if(getBookID){
    res.status(200).send(getBookID);
  }
  else{ // Error message
    res.status(404).send({message: `Book ${id} not found`});
  }
});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY _id //!!!!!!!!!!!!!!!!!!
*/


///////////////// ROUTES //////////////////





/* UPDATE BOOK
//```````````````````` UPDATE A BOOK //````````````````````
// Update a book by the _id    updates can use a    put    or   post 
app.put("/books/:id", (req, res) => {
  const id = req.params.id; // getting the id from the user
  const currentBook = books.find(bookID => bookID._id == id) // This looks 

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedBook = req.body;  // An .body is an object in updatedBook lets our body read the books id
  
  // If currentBook is true
  if(currentBook){
      for(const key in updatedBook){  // loops through the keys in the updated books (title, author, genre, etc)
        if(currentBook[key] != updatedBook[key]){ // if the current books title is not == to the updated book 
          currentBook[key] = updatedBook[key]; // go ahead and update it
        }
      }


      // We will save the current book back into the array
      const index = books.findIndex(bookID => bookID._id == id);
      if(index != -1){
        books[index] == currentBook; // saving book data back into the array
      }

      res.status(200).send(`Book ${id} updated`); // Success Message

  }
  else{ // ERROR MESSAGE
    res.status(404).send({message: `Book ${id} not found`});
  }



});
//```````````````````` UPDATE A BOOK //````````````````````
*/



/* ADDING A BOOK
// ++++++++++++++++ ADDING A NEW BOOK TO THE ARRAY ++++++++++++++++++

app.post("/books/add", (req, res) => {
  const newBook = req.body; // Getting the users data from the body like a form


  // If there is a valid new book
  if(newBook){

      // This is adding a new id
      const id = books.length + 1;  // gets the length of the array and counts them so it can +1 for new ID 
      newBook._id = id; // Sets the newBooks _id to +1 after the last _id of books


      books.push(newBook); // Pushing our new book data into our array


      res.status(200).json({message: `Book ${newBook.title} added)`}); // SUCCESS MESSAGE
  }
  else{ // ERROR MESSAGE
    res.status(400).json({message: "Error when adding a New Book"});
  }



})

// ++++++++++++++++ ADDING A NEW BOOK TO THE ARRAY ++++++++++++++++++
*/





/* DELETING BOOK
// -------------------- DELETING BOOK FROM ARRAY -------------------

app.delete("/books/:id", (req, res) => {
  const id = req.params.id; // gets the id from the users url

  // Reads the _ids position in the array 
  const index = books.findIndex(bookID => bookID._id == id);

  if(index != -1){                                                           // our id we wrote
    books.splice(index,1); // this is starting at what item and the amount of items (index, 1 item)
    res.status(200).json({message: `Book ${id} deleted`});
  }
  else{
    res.status(404).json({message: `Book ${id} Not Found`});
  }



});


// -------------------- DELETING BOOK FROM ARRAY -------------------
*/




// This if the process in .env is true use port 3000 OR use 3001
const port = process.env.PORT || 3001;


// Listen on port variable or 3001
app.listen(port, () => {
  debugServer(`Server is listening on http://localhost:${port}`)
})


/* OLD PORTING WITHOUT .env
// Listen on port 3000
app.listen(3000, () => {
  debugServer("Server is listening on http://localhost:3000")
})
*/