// npm init -y  
// npm i express

// This is our MongoDB Driver
// npm install mongodb



// I I I I I I I    IMPORTS   I I I I I I I 

import { MongoClient } from "mongodb";
// Converts strings into ids for mongo
import { ObjectId } from "mongodb";

// Lets us use debug using debugDatabase
import debug from "debug";
const debugDatabase = debug("app:Database");

// I I I I I I I    IMPORTS   I I I I I I I 




let _db = null;



// Allows us to store the users Id and generate it
const newId = (str) => new ObjectId(str);



// $$$$$$$$$$$$$$$ CALLING IN OUR DATABASE $$$$$$$$$$$$$$$//
async function connect(){
  if(!_db){
    // Replace the placeholder with your Atlas connection string THIS CAN BE FOUND ON MONGODB ATLAS
    //const connectionString = "mongodb+srv://Tony_Cook:Fuggetaboutit55!@cluster0.gzvhh85.mongodb.net/?retryWrites=true&w=majority";
    const connectionString = process.env.DB_URL;

    // Name of the database
    //const dbName = "RetroAmazon";
    const dbName = process.env.DB_NAME;

    // Connects to the database we said
    const client = await MongoClient.connect(connectionString);


    _db = client.db(dbName)
  }
  return _db;
} // end of connect function
// $$$$$$$$$$$$$$$ CALLING IN OUR DATABASE $$$$$$$$$$$$$$$//





// SUCCESS MESSAGES
async function ping(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  await dbConnected.command({ping: 1});

  debugDatabase("Pinged your deployment. You successfully connected to MongoDB!\n");
} // end of ping function
// SUCCESS MESSAGES










// eeeeeeeeeeeeeeeeeeeeeeeee EDITS MADE DURING AN UPDATE eeeeeeeeeeeeeeeeeeeeeeeee //
async function saveEdit(editMade){
  const db = await connect();


  const editsMade = await db.collection("Edits").insertOne(editMade);

  return editsMade;
}
// eeeeeeeeeeeeeeeeeeeeeeeee EDITS MADE DURING AN UPDATE eeeeeeeeeeeeeeeeeeeeeeeee //











// ******************************* BOOKS ********************************** //


// ~~~~~~~~~~~~~~~~ FIND ALL BOOKS ~~~~~~~~~~~~~~~~ //
async function getBooks(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // Mongo Shell Command to find all the book: db.books.find()
  // "Book" == the collection name in our database
  // .find() returns a cursor, which is a pointer to the result set of a query
  const allBooks = await dbConnected.collection("Book").find().toArray();

  //Returns Books to postman
  return allBooks;
}
// ~~~~~~~~~~~~~~~~ FIND ALL BOOKS ~~~~~~~~~~~~~~~~ //





// !!!!!!!!!!!!!!! SEARCHING FOR A BOOK BY ID !!!!!!!!!!!!!!! //
async function getBookById(booksId){
  const dbConnected = await connect();
                                       // Uses this call in:  import { ObjectId } from "mongodb";
  const findBooks = await dbConnected.collection("Book").findOne({_id: new ObjectId(booksId)});

  return findBooks;
}
// !!!!!!!!!!!!!!! SEARCHING FOR A BOOK BY ID !!!!!!!!!!!!!!! //






// uuuuuuuuuuuuuuuuu UPDATE A BOOK uuuuuuuuuuuuuuuuu //
async function updateBook(booksId, updatedBook){

  const dbConnected = await connect();

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bookUpdated = await dbConnected.collection("Book").updateOne({_id: new ObjectId(booksId)},{$set:{...updatedBook}});

  return bookUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A BOOK uuuuuuuuuuuuuuuuu //





// +++++++++++++++++ ADDING A NEW BOOK +++++++++++++++++ //
async function addBook(newBook){
  const dbConnected = await connect();

  const addingBook = await dbConnected.collection("Book").insertOne(newBook);

  //console.table(addingBook);

  return addingBook;
}

// +++++++++++++++++ ADDING A NEW BOOK +++++++++++++++++ //







// ------------------ DELETE BOOK BY ID ------------------ //
async function deleteBook(booksId){

  const dbConnected = await connect();

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const deleteBook = await dbConnected.collection("Book").deleteOne({_id: new ObjectId(booksId)});

  return deleteBook;
}
// ------------------ DELETE BOOK BY ID ------------------ //

// ******************************* BOOKS ********************************** //














// rrrrrrrrrrrrrrrrrrrrrrrrrrrrr    ROLE   rrrrrrrrrrrrrrrrrrrrrrrrrrrrr //
async function findRoleByName(roleName){
  const db = await connect();

  const findRole = await db.collection("Role").findOne({name:roleName})

  return findRole;
}

export{
  findRoleByName
}
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrr    ROLE   rrrrrrrrrrrrrrrrrrrrrrrrrrrrr //
















// ******************************* USERS ********************************** //




// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //
async function getUsers(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  const allUsers = await dbConnected.collection("User").find().toArray();

  //Returns All Users to postman
  return allUsers;
}
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //







// !!!!!!!!!!!!!!! SEARCHING FOR A USER BY ID !!!!!!!!!!!!!!! //
async function getUserById(usersId){

  const dbConnected = await connect();

  // Finding a user based on their Id
  const foundUserId = await dbConnected.collection("User").findOne({_id: usersId});

  return foundUserId;
}
// !!!!!!!!!!!!!!! SEARCHING FOR A USER BY ID !!!!!!!!!!!!!!! //







// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //

async function addUser(user){
  const dbConnected = await connect();

  // Giving new users a default role as a customer
  user.role = ["Customer"];

  const newUser = await dbConnected.collection("User").insertOne(user);

  return newUser;
}

// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //









// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL // 
async function loginUser(user){

  const dbConnected = await connect();

  // Finding a user based on their email entered
  const userLoggedIn = await dbConnected.collection("User").findOne({email: user.email});

  // It will either find or not find the user based on the inputs
  return userLoggedIn;

}
// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL // 






// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu //
async function updateUser(getUser/*, updatedUserFields*/){

  const dbConnected = await connect();


  // This date is for searching purposes
  //updatedUserFields.lastUpdated = new Date();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  //updatedUserFields.userLastUpdated = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const userUpdated = await dbConnected.collection("User").updateOne({_id: getUser._id},{$set:{...getUser}});

  return userUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu //










// ******************************* USERS ********************************** //








// Shows our Success Message
ping();


export {connect, ping, newId}

// EXPORTS ALL THE BOOK FUNCTIONS
export {getBooks, getBookById, addBook, updateBook, deleteBook}


// EXPORTS ALL THE USER FUNCTIONS
export {getUsers, getUserById, addUser, loginUser, updateUser}



export {saveEdit}


