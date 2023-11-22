


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


// ccccc 🍪COOKIES & AUTH TOKEN 🍪 ccccc //
// Allows us to make new tokens to authorize users when they log in
import  jwt from "jsonwebtoken";

// This is a method that allows a user to NEED TO BE LOGGED IN
import { isLoggedIn } from "@merlin4/express-auth";
// ccccc 🍪COOKIES & AUTH TOKEN 🍪 ccccc //



// aaaaaaaaaaaaaaaa AUTHORIZE USERS aaaaaaaaaaaaaaaa//
// USED FOR AUTHORIZATION this will call in the ability to check a users role and see the permissions they have
import { fetchRoles} from "@merlin4/express-auth";


// This will 
import { mergePermissions } from "@merlin4/express-auth";


//This calls in a function from merlin that will send an error if a users Role does not match the permissions we gave that role in the Collection
import { hasPermission } from "@merlin4/express-auth";


// Calls in the ability to look in the Role collection and see if it matches the users role
import { findRoleByName } from "../../database.js";
// aaaaaaaaaaaaaaaa AUTHORIZE USERS aaaaaaaaaaaaaaaa//


// Imports Joi to use the middleware functions we made in validBody()
import Joi from "joi";


// Calls in adding a new user and logging in functions  
import { getUsers, getUserById, addUser, loginUser, updateUser,     saveEdit } from "../../database.js";


// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import { validBody } from "../../middleware/validBody.js"
import { validId } from "../../middleware/validId.js";

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



    // rrrrrrrr    ROLE   rrrrrrrr //
      // This will get the logged in user and their role then call our function findRoleByName and plug in that role
      const roles = await fetchRoles(user, role => findRoleByName(role));

      // This will merge the roles the user has and the Roles we have in Collection to give them permissions of True
      const permissions = mergePermissions(user,roles);

      // Puts the permissions the user has and puts it into the payload to then be passed into the users cookie to signify they have access of true
      payload.permissions = permissions;

      debugUser(`The users permissions are ${permissions}`);
    // rrrrrrrr    ROLE   rrrrrrrr //



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
router.get('/list',   isLoggedIn(),       async (req, res) => {

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
      res.status(200).json({Success: `Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In.`,
      AuthToken: `Your Auth Token is ${authToken}`,
      // fullname ADDED THIS TO THE MESSAGE TO ALLOW US TO CALL IT IN ON LOG IN TO SAVE IN NAVBAR
      fullName: usersLoggedIn.fullName,
      // rolesa This sends the roles in the message to be called in to check the users permissions
      roles: `${usersLoggedIn.fullName} Has The Roles of ${usersLoggedIn.role}`});

      debugUser(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`); // Message Appears in terminal
  }
  else{
    // Error Message
    res.status(400).json("Email or Password Incorrect");
    debugUser(`Email or Password Incorrect`); // Message Appears in terminal
  }

});
// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL // 





// LOLOLOLOLOLOLOLOL  USER LOGS OUT  LOLOLOLOLOLOLOLOL //
router.post("/logout", isLoggedIn(), async (req,res) => {
  res.clearCookie("authToken");
  res.status(200).json({message: "You Have Been Logged Out"});
});
// LOLOLOLOLOLOLOLOL  USER LOGS OUT  LOLOLOLOLOLOLOLOL //














// uuuuuuuuuuuuuuuuu  USER UPDATES THEMSELVES IF LOGGED IN  uuuuuuuuuuuuuuuuu //
const updateSelfSchema = Joi.object({
  fullName: Joi.string()
  .trim()
  .min(1)
  .max(50),

  password: Joi.string()
  .trim()
  .min(8)
  .max(50),
});


 // A user Must be logged in to allow this function isLoggedIn() to pass
router.put('/update/me', isLoggedIn(), validBody(updateSelfSchema), async (req,res) => {

  const updatedUserFields = req.body;

  try {
    // If the user is logged in then we will get THAT LOGGED IN USERS ID
    const getLoggedInUser = await getUserById(newId(req.auth._id))


    // IF the user is actually logged in do the update process
    if(getLoggedInUser){

      // If the user enters something into these fields their newly inputted data in the body will be sent as the new data
      if(updatedUserFields.fullName){
        getLoggedInUser.fullName = updatedUserFields.fullName;
      }
      if(updatedUserFields.password){
        // This will get the password the user enters and then Re-hash it so its not clear to viewers to the database
        getLoggedInUser.password = await bcrypt.hash(updatedUserFields.password, 10);
      }


      // Calls in the updateUser Function that actually sends users newly inputted body params to the users params
      const userUpdatedSelf = await updateUser(getLoggedInUser);


      // If modified send success message
      if(userUpdatedSelf.modifiedCount == 1){ // SUCCESS MESSAGE


        const editsMade = {
          timeStamp: new Date(),
          userUpdatedThemselvesOn: new Date().toLocaleString('en-US'),
          operation: "Self-Edit Update User", 
          collection: "User",
          userUpdated: getLoggedInUser._id,
          auth: req.auth // Cookie information
        }

        let updatesMade = await saveEdit(editsMade);


        res.status(200).json({Update_Successful: `Hello ${updatedUserFields.fullName}! You Have Successfully Updated Yourself. Your User Id is ${newId(req.auth._id)}`, updatesMade  });
        return;
      }
      else{ // ERROR
        res.status(400).json({Update_Error: `Hello ${updatedUserFields.fullName}! Sadly We Weren't able to Update You. Your User Id is ${newId(req.auth._id)}`});
        return;
      }

    }
  }catch (err) {
    res.status(500).json({Error: err.stack});
  }



});

// uuuuuuuuuuuuuuuuu  USER UPDATES THEMSELVES IF LOGGED IN  uuuuuuuuuuuuuuuuu //










// Admin uuuuuuuuuuuuuu Admin   UPDATE A USER IF ADMIN   Admin uuuuuuuuuuuuuu Admin //
const updateUserSchema = Joi.object({
  fullName: Joi.string()
  .trim()
  .min(1)
  .max(50),

  password: Joi.string()
  .trim()
  .min(8)
  .max(50),
});




router.put('/update/:id',   isLoggedIn(),   validId('id'),  validBody(updateUserSchema), async (req,res) => {

  // Gets the users input from the body
  const updatedUserFields = req.body;

  // This calls in the getting a user by their Id function and we acquire the whole users info
  const getUser = await getUserById(req.id)

  // If We get a successful User Id Go on
  if(getUser){
      // If the user enters something into these fields their newly inputted data in the body will be sent as the new data
      if(updatedUserFields.fullName){
        getUser.fullName = updatedUserFields.fullName;
      }
      if(updatedUserFields.password){
        // This will get the password the user enters and then Re-hash it so its not clear to viewers to the database
        getUser.password = await bcrypt.hash(updatedUserFields.password, 10);
      }

      // Calls in the updateUser Function that actually sends users newly inputted body params to the users params
      const updatedUser = await updateUser(getUser /*, updatedUserFields */);


      // If modified send success message
      if(updatedUser.modifiedCount == 1){


        // eeeeeeee EDITS MADE eeeeeeee // 
        // This is the 
        const editsMade = {
          timeStamp: new Date(),
          adminUpdatedUserOn: new Date().toLocaleString('en-US'),
          operation: "Admin Update User", 
          collection: "User",
          userUpdated: getUser._id,
          auth: req.auth // Cookie information
        }

        // Calls in the saveEdit function to properly add the above array to a new collection named Edit
        let updatesMade = await saveEdit(editsMade);
        // eeeeeeee EDITS MADE eeeeeeee // 

        res.status(200).json({Update_Successful: `User ${req.id} Successfully Updated`, updatesMade});
        return;
      }
      else{
        res.status(400).json({Error: `User ${req.id} Not Updated`});
        return;
      }
  }
  else{
    res.status(400).json({Error: `User ${req.id} Not Updated`});
  }

});
// uuuuuuuuuuuuuuuuu UPDATE A USER IF ADMIN uuuuuuuuuuuuuuuuu //

















export {router as UserRouter}
