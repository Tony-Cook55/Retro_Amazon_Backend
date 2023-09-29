


// I I I I I I I    IMPORTS   I I I I I I I 

// npm i express
import express from "express";


import debug from "debug";
//Create a debug channel called User
const debugUser = debug("app:User"); // Messages will Appear in terminal
//debugUser.color = "63";

//This allows us to encrypt our passwords using this: npm i bcrypt    
import bcrypt from "bcrypt";


import { addUser, loginUser } from "../../database.js";

// I I I I I I I    IMPORTS   I I I I I I I 



const router = express.Router();





// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //  http://localhost:3000/api/users/add
router.post("/add", async (req, res) => {

  // Users input for the new user
  const newUser = req.body;

  // - USING BCRYPT HERE -
  // This will generate a salt round and hash the password entered to encrypt it
  newUser.password = await bcrypt.hash(newUser.password, 10)


  try {
      // Adding users input and plugging it into the addUser Function
      const addedNewUser = await addUser(newUser);
      
      // Success Message
      res.status(200).json({message: `User ${addedNewUser.insertedId} Added`});
      debugUser(`User ${addedNewUser.insertedId} Added \n`); // Message Appears in terminal
  }
  catch (err) {
    res.status(500).json({error: err.stack});
  }

});
// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ // 











// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL //  http://localhost:3000/api/users/login

router.post("/login", async (req, res) => {

  // Users input from the user to login
  const usersFields = req.body;

  // Inputs users input into the loginUser Function
  const usersLoggedIn = await loginUser(usersFields);


  // If the entered password is the same as the password that encrypted - success
  if(usersLoggedIn && await bcrypt.compare(usersFields.password, usersLoggedIn.password)){
      // Success Message
      res.status(200).json(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`);
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
