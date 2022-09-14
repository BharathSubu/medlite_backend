const express = require("express")
const PUser = require("../model/puser.model")
const Profile = require("../model/profile.model");
const config = require("../config");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const DUser = require("../model/duser.model")

//java web token generated for every idividual user
const router = express.Router();
//routes is used from the index page
// Use the express.Router class to create modular, mountable route handlers.
// A Router instance is a complete middleware and routing system;
//  for this reason, it is often referred to as a “mini-app”.
const fs = require('fs');

const middleware = require("../middleware")



router.route("/").get((req,res)=> res.json("Your UDser Page Got it"));

router.route("/:username").get(middleware.checkToken , (req, res) => {
    User.findOne({ username: req.params.username }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      return res.json({
        data: result,
        username: req.params.username,
      });
    });
  });


  router.route("/getdata/:email").get( (req, res) => {
    //finding the profile data of the user from mongodb database
      PUser.findOne( { email: req.params.email }, (err, result) => {
        if (err) return res.json({ err: err });
        else if (result == null) {
          return res.json({ status: false,  email: req.params.email  });
        } else {
          return res.status(200).json({ status: true, 
             name: result["name"] ,
             img: result["img"] ,
             email: result["email"],            
            });
        }
      });
    });
    const storage = multer.diskStorage({
      //the path where its to be stored
      //cb callback function
      destination: (req, file, cb) => {
        cb(null, "./uploads");
      },
      //filename of the uploades image
      filename: (req, file, cb) => {
        cb(null, req.params.email + ".jpg");
      },
    
    });
    
    
    
    //multer package instage
    const upload = multer({
      //it defines the path where we will store the image 
      //instance for the storage
      storage: storage,
      //limiting the size of the file
      limits: {
        fileSize: 1024 * 1024 * 6,
      },
      //fileFilter: fileFilter,
    });
  
//adding and update profile image
router
.route("/add/image/:email")
.patch(middleware.checkToken, upload.single("img"), async (req, res) => {
  await PUser.findOneAndUpdate(
   
    { email : req.params.email },
    { //setting the img value
      $set: {
        //this instance is gotten from our mutter instance
        img: req.file.path,
      },
    },
    { new: true },
    (err, profile) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "image added successfully updated",
        data: profile,
      };
      return res.status(200).send(response);
    }
  ).clone().exec();;
});





router.route("/login").post((req, res) => {
  PUser.findOne({ email: req.body.email }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      if (result === null) {
        return res.status(403).json("Username incorrect");
      }
      if (result.password === req.body.password) {
        // here we implement the JWT token functionality
        let token = jwt.sign({ email: req.body.email }, config.key, {
          //  expiresIn:"24h" //token expiring duration
        });
        res.json({
          token: token,
          msg: "success",
        });
      } else {
        res.status(403).json("password is incorrect");
      }
    });
  });
  
router.route("/register").post((req, res) => {
    console.log("inside the register");// checking our entry

    //exported from user.model to create a user object that follows the schema
    //this is being saved in the user database of the mongo db 
    const user = new PUser({ 
      name: req.body.name,
      phone:req.body.phone,
      password: req.body.password,
      email: req.body.email,
    }); //object created from the schema 
    user
      .save() // saving to mongoose
      .then(() => {
        console.log("Puser registered");
        res.status(200).json({ msg: "PUser Successfully Registered" });
      })
      .catch((err) => {
        res.status(403).json({ msg: err }); // checeking for the error
      });
  });
  


  router.route("/sendreq/:email/:pemail").get( (req, res) => {
    //finding the profile data of the user from mongodb database
    DUser.findOneAndUpdate( // to find the user and update the password from the collections
    { email: req.params.email },//user name remains the same
    { $addToSet: { requests : [req.params.pemail] },
    // password is set from the postman body
   },{ new: true },
    (err, result) => {
      if (err) return res.json({ msg: err });
      else{
      const msg = {
        msg: "request sent",
        attribute: req.params.attr,
      };
      // return res.status(200).json(msg);
    }
    }
  );
  PUser.findOneAndUpdate( // to find the user and update the password from the collections
  { pemail: req.params.pemail },//user name remains the same
  { $addToSet: { requests : [req.params.email] },
  // password is set from the postman body
 },{ new: true },
  (err, result) => {
    if (err) return res.json({ msg: err });
    else{
    const msg = {
      msg: "request sent",
      attribute: req.params.attr,
    };
     return res.status(200).json(msg);}
  }
);
  });

  module.exports = router