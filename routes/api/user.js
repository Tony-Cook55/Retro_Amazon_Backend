


// I I I I I I I    IMPORTS   I I I I I I I 

// npm i express
import express from "express";


import debug from "debug";
//Create a debug channel called User
const debugUser = debug("app:User"); // Messages will Appear in terminal
//debugUser.color = "63";

//This allows us to encrypt our passwords using this: npm i bcrypt    
import bcrypt from "bcrypt";


// Imports the use of creating a new user id
import { newId } from "../../database.js";


// Allows us to make new tokens to authorize users when they log in
import  jwt from "jsonwebtoken";


// Imports Joi to use the middleware functions we made in validBody()
import Joi from "joi";






// Calls in adding a new user and logging in functions  
import { getUsers, addUser, loginUser } from "../../database.js";



// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import { validBody } from "../../middleware/validBody.js"

// I I I I I I I    IMPORTS   I I I I I I I 



const router = express.Router();



// cccccccccccccccccccccccc COOKIES & AUTH TOKEN cccccccccccccccccccccccc //
// This goes into the jsonWebToken 
async function issueAuthToken(user){

  // This is the things that will be shown on the front end that being the users Id, Email, and their role
  const payload = {_id: user._id, email: user.email, role: user.role};

  // This is the way to decrypt the token so like don't lose this
  const secret = process.env.JWT_SECRET;

  // Sets the time in which the token will expire
  const options = {expiresIn: "1h"}

  // makes the token putting all the variables in
  const authToken = jwt.sign(payload, secret, options);

  return authToken;
}


// This is the cookie that calls in the authToken as well
function issueAuthCookie(res, authToken){

  // This is the options of the cookie and also sets the age to 1hr (1000 milliseconds * 60 *60)
  const cookieOptions = {httpOnly: true, maxAge: 1000*60*60};

  // Creates the cookie using the cookieOptions and calls in the token from above
  res.cookie("authToken", authToken, cookieOptions);
}



// cccccccccccccccccccccccc COOKIES & AUTH TOKEN cccccccccccccccccccccccc //






// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ http://localhost:3000/api/users/list
router.get('/list', async (req, res) => {

    // Calls in the getBooks() Function finding all books
    const allUsers = await getUsers();

    // Success Message
    res.status(200).json(allUsers);
});
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~






// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //  http://localhost:3000/api/users/add


// Step 1 Define the New User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const newUserSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(50).required(),
  password: Joi.string().trim().min(8).max(50).required(),
  email: Joi.string().trim().email().required()
});



// Calling in our custom middleware function validBody(), then we plug in the rule set schema -> validBody(newUserSchema)
router.post("/add", validBody(newUserSchema), async (req, res) => {

  // Users input for the new user
  const newUser = 
  {
    _id: newId(),
    ...req.body,
    createdDate: new Date(),
  }

  // - USING BCRYPT HERE -
  // This will generate a salt round and hash the password entered to encrypt it
  newUser.password = await bcrypt.hash(newUser.password, 10)


  try {
      // Adding users input and plugging it into the addUser Function
      const addedNewUser = await addUser(newUser);
      
        if(addedNewUser.acknowledged == true){

          // ccc COOKIES ccc //
          // Send our new user to the function that sets them with a new token and the token is then set in a cookie
          const authToken = await issueAuthToken(newUser);

          // Adds the authToken into the cookie that was made
          issueAuthCookie(res, authToken);
          // ccc COOKIES ccc //

          // Success Message
          res.status(200).json({message: `User ${addedNewUser.insertedId} Added. Your AuthToken is ${authToken}`});
          debugUser(`User ${addedNewUser.insertedId} Added \n`); // Message Appears in terminal
        }
  }
  catch (err) {
    res.status(500).json({error: err.stack});
  }

});
// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ // 













// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL //  http://localhost:3000/api/users/login



// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const loginUserSchema = Joi.object({
  password: Joi.string().trim().min(8).max(50).required(),
  email: Joi.string().trim().email().required()
})


// Calling in our custom middleware function validBody(), then we plug in the rule set schema -> validBody(loginUserSchema)
router.post("/login", validBody(loginUserSchema), async (req, res) => {

  // Users input from the user to login
  const usersFields = req.body;

  // Inputs users input into the loginUser Function
  const usersLoggedIn = await loginUser(usersFields);


  // If the entered password is the same as the password that encrypted - success
  if(usersLoggedIn && await bcrypt.compare(usersFields.password, usersLoggedIn.password)){

          // ccc COOKIES ccc //
          // Send our new user to the function that sets them with a new token and the token is then set in a cookie
          const authToken = await issueAuthToken(usersLoggedIn);

          // Adds the authToken into the cookie that was made
          issueAuthCookie(res, authToken);
          // ccc COOKIES ccc //

      // Success Message
      res.status(200).json(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In. Your Auth Token is ${authToken}`);
      debugUser(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`); // Message Appears in terminal
  }
  else{
    // Error Message
    res.status(400).json({error: "Email or Password Incorrect"});
    debugUser(`Email or Password Incorrect`); // Message Appears in terminal
  }

});
// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL // 















export {router as UserRouter}
