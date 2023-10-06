

// I I I I I I I    IMPORTS   I I I I I I I 

// npm i express
import express from "express";


import debug from "debug";

//Create a debug channel called Book
const debugBook = debug("app:Book"); // Messages will Appear in terminal


// Imports all the functions from the database.js file 
import { connect, getBooks, getBookById, updateBook, addBook, deleteBook } from "../../database.js";




// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import Joi from "joi";

import { validId } from "../../middleware/validId.js";

import { validBody } from "../../middleware/validBody.js";



// I I I I I I I    IMPORTS   I I I I I I I 



const router = express.Router();







// ~~~~~~~~~~~~~~~~ FIND ALL BOOKS ~~~~~~~~~~~~~~~~ // http://localhost:3000/api/books/books-list
//Making a route to see all the books    to see books type   
router.get("/books-list", async (req, res) => {

  try {

    // Connects to the DB Using the connect Function
    const dbConnected = await connect();

    // Calls in the getBooks() Function finding all books
    const allBooks = await getBooks();

    // Success Message
    res.status(200).json(allBooks);

    debugBook("Success Got all the Books \n"); // Message Appears in terminal

  } 
  catch (err) { // Error Message
    res.status(500).json({error: err.stack});
  }

});
// ~~~~~~~~~~~~~~~~ FIND ALL BOOKS ~~~~~~~~~~~~~~~~ //









//!!!!!!!!!!!!!!!!!!  SEARCHING BY _id //!!!!!!!!!!!!!!!!!!   http://localhost:3000/api/books/(_id of book)
// What ever is in the /:("HERE") you must make it the same as what in validId("HERE")
router.get("/:id",   validId("id"),   async (req, res) => {   // the :id   makes a param variable that we pass in
  
        // 
        const bookId = req.id;  // We don't need to have .params is due to the validId("id") is using the id from the params in function 

  try {
      // were are getting a request with the parameters a user puts for the .id
      //const bookId = req.params.id;  

      // for every bookID return true when our _id is == to the id user enters
      const getBookID = await getBookById(bookId);


      // Checking to see if the book is in the database based on id if so success show book
      if(getBookID){
        // Success Message
        res.status(200).json(getBookID);
        debugBook(`Success Got Book's Id: ${bookId} \n`); // Message Appears in terminal
      }
      else{
        res.status(500).json({Error: `Book Id: ${bookId} Not Found`});
        debugBook(`Error Book Id: ${bookId} Not Found \n`); // Message Appears in terminal
      }
  }
  catch (err) {
    // Error Message
    res.status(500).json({error: err.stack});
  }

});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY _id //!!!!!!!!!!!!!!!!!!









// uuuuuuuuuuuuuuuuu UPDATE A BOOK uuuuuuuuuuuuuuuuu //   // http://localhost:3000/api/books/update/(_id of book)


// THIS IS THE RULES THAT OUR UPDATING FIELDS MUST FOLLOW TO NOT THROW AN ERROR
const updateBookSchema = Joi.object({
  isbn: Joi.string().trim().min(14),
  title: Joi.string().trim().min(1),
  author:  Joi.string().trim().min(1),
  genre: Joi.string().valid("Fiction", "Non-fiction", "Drama", "Horror", "Dystopian", "Mystery", "Young Adult", "Magical Realism"),
  publication_year: Joi.number().min(1900).max(2023),
  price: Joi.number().min(0),
  description: Joi.string().trim().min(1),
});


// Update a book by the _id    updates can use a    put    or   post 
// Adding both the validating ID function and the validating body function using the ID entered by user and the schema as a rule set
router.put("/update/:id",   validId("id"), validBody(updateBookSchema),  async (req, res) => {

   // getting the id from the user
  const bookId = req.id;  // We don't need to have .params is due to the validId("id") is using the id from the params in function 

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedBookFields = req.body;  // An .body is an object in updatedBookFields lets our body read the books id
  

  // If a user enters a number for price it changes it to a float not a string
  if(updatedBookFields.price){
    updatedBookFields.price = parseFloat(updatedBookFields.price);
  }


  try {
      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bookUpdated = await updateBook(bookId, updatedBookFields);

      // If the book is updated once it will gain a property called modifiedCount if this is 1 its true
      if(bookUpdated.modifiedCount == 1){
        // Success Message
        res.status(200).json({message: `Book ${bookId} updated`});
        debugBook(`Book ${bookId} updated  \n`); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(400).json({error: `Book ${bookId} Not Found`});
        debugBook(`Book ${bookId} Not Found  \n`); // Message Appears in terminal
      }
  } 
  catch (err) {
    res.status(500).json({error: err.stack});
  }


});
// uuuuuuuuuuuuuuuuu UPDATE A BOOK uuuuuuuuuuuuuuuuu //













// +++++++++++++++++ ADDING A NEW BOOK +++++++++++++++++ //  http://localhost:3000/api/books/add

// THIS IS THE RULES THAT OUR ADDING FIELDS MUST FOLLOW TO NOT THROW AN ERROR
const newBookSchema = Joi.object({
  isbn: Joi.string().trim().min(14).required(),
  title: Joi.string().trim().min(1).required(),
  author:  Joi.string().trim().min(1).required(),
  genre: Joi.string().valid("Fiction", "Non-fiction", "Drama", "Horror", "Dystopian", "Mystery", "Young Adult", "Magical Realism").required(),
  publication_year: Joi.number().min(1900).max(2023).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().trim().min(1).required(),
});



// This validBody(newBookSchema) will call in the function named validBody then plug in the newBookSchema for us to follow
router.post("/add", validBody(newBookSchema), async (req, res) => {
  
  // Getting the users data from the body like a form
  const newBook = req.body;  // We don't need to have .params is due to the validId("id") is using the id from the params in function 


    // If a user enters a number for price it changes it to a float not a string
    if(newBook.price){
      newBook.price = parseFloat(newBook.price);
    }


  try {
      // Adds the users input from the body and plugs it into the addBook Function
      const dbNewBook = await addBook(newBook);

      // If user adding a new book is true it wil lbe known as acknowledged
      if(dbNewBook.acknowledged == true){
        // Success Message
        res.status(200).json({message: `Book ${newBook.title} Added With An Id of ${dbNewBook.insertedId}`});
        debugBook(`Book ${newBook.title}  Added With An Id of ${dbNewBook.insertedId} \n`); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(400).json({error: `Book ${newBook.title} Not Added`});
        debugBook(`Book ${newBook.title} Not Added  \n`); // Message Appears in terminal
      }
  }
  catch (err) {
    res.status(500).json({error: err.stack});
  }

})
// +++++++++++++++++ ADDING A NEW BOOK +++++++++++++++++ //









// ------------------ DELETE BOOK BY ID ------------------ // http://localhost:3000/api/books/delete/(Book _id Here)
router.delete("/delete/:bookId",  validId("bookId"), async (req, res) => {

  // gets the id from the users url
  const booksId = req.bookId;// We don't need to have .params is due to the validId("id") is using the id from the params in function 


  try {
    // Uses the books id and plugs it into the deleteBook function
      const dbDeleteBook = await deleteBook(booksId);

      if(dbDeleteBook.deletedCount == 1){
        // Success Message
        res.status(200).json({message: `Book ${booksId} Deleted`});
        debugBook(`Book ${dbDeleteBook.title} Deleted  \n`); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(400).json({error: `Book ${booksId} Not Deleted`});
        debugBook(`Book ${dbDeleteBook.title} Not Deleted  \n`); // Message Appears in terminal
      }
  }
  catch (err) {
    res.status(500).json({error: err.stack});
  }

});

// ------------------ DELETE BOOK BY ID ------------------ //









// Exports our object router and names it BookRouter for us to call in the server.js file
export {router as BookRouter};

