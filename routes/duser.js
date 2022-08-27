const express = require("express")
const DUser = require("../model/duser.model")
const Profile = require("../model/profile.model");
const config = require("../config");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const PUser = require("../model/puser.model")

//java web token generated for every idividual user
const router = express.Router();
//routes is used from the index page
// Use the express.Router class to create modular, mountable route handlers.
// A Router instance is a complete middleware and routing system;
//  for this reason, it is often referred to as a “mini-app”.
const fs = require('fs');

const middleware = require("../middleware")



router.route("/").get((req,res)=> res.json("Your UDser Page Got it"));

router.route("/getdoctors").get((req, res) => {
  DUser.find({ name: { $ne: "" } }, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({status:true, data: result });
  });
});

router.route("/getMypatients/:email").get( (req, res) => {
  PUser.find({ doctors: {$in: [ req.params.email ] }}, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({status:true, data: result });
  });
});

router.route("/accept/:email/:pemail").get( (req, res) => {
  PUser.findOneAndUpdate( // to find the user and update the password from the collections
  { pemail: req.params.pemail },//user name remains the same
  { $addToSet: { doctors: [req.params.email] },}, (err, result) => {
    if (err) return res.json(err);
    // return res.status(200).json({status:true, data: result });
  });
  DUser.findOneAndUpdate( // to find the user and update the password from the collections
  { email: req.params.email },//user name remains the same
  { $addToSet: { patients: [req.params.pemail] },}, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({status:true, data: result });
  });
});

router.route("/login").post((req, res) => {
  DUser.findOne({ email: req.body.email }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      if (result === null) {
        return res.status(403).json("Username incorrect");
      }
      if (result.password === req.body.password) {
        // here we implement the JWT token functionality
        let token = jwt.sign({ username: req.body.username }, config.key, {
          //  expiresIn:"24h" //token expiring duration
        });
        res.json({
          token: token,
          email: req.body.email,
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
    const duser = new DUser({ 
      name: req.body.name,
      role:req.body.role,
      phone:req.body.phone,
      password: req.body.password,
      email: req.body.email, 
    }); //object created from the schema 
    duser
      .save() // saving to mongoose
      .then(() => {
        console.log("Duser registered");
        res.status(200).json({ msg: "DUser Successfully Registered" });
      })
      .catch((err) => {
        res.status(403).json({ msg: err }); // checeking for the error
      });
  });
  

  router.route("/getdata/:email").get( (req, res) => {
    //finding the profile data of the user from mongodb database
      DUser.findOne( { email: req.params.email }, (err, result) => {
        if (err) return res.json({ err: err });
        else if (result == null) {
          return res.json({ status: false,  email: req.params.email  });
        } else {
          return res.status(200).json({ status: true, 
             name: result["name"] ,
             img: result["img"] ,
             role:result["role"] ,
             email: result["email"],
             img : result["img"],
             attribute : result["attribute"]
            
            });
        }
      });
    });


    router.route("/setattribute/:email/:attr").get( (req, res) => {
      //finding the profile data of the user from mongodb database
      DUser.findOneAndUpdate( // to find the user and update the password from the collections
      { email: req.params.email },//user name remains the same
      { $addToSet: { attribute: [req.params.attr] },
      // password is set from the postman body
     },{ new: true },
      (err, result) => {
        if (err) return res.json({ msg: err });
        else{
        const msg = {
          msg: "password successfully updated",
          attribute: req.params.attr,
        };
        return res.status(200).json(msg);}
      }
    );
    });

    router.route("/addpatient/:email/:pemail").get( (req, res) => {
      //finding the profile data of the user from mongodb database
      DUser.findOneAndUpdate( // to find the user and update the password from the collections
      { email: req.params.email },//user name remains the same
      { $addToSet: { patients: [req.params.pemail] },
      // password is set from the postman body
     },{ new: true },
      (err, result) => {
        if (err) return res.json({ msg: err });
        else{
        const msg = {
          msg: "password successfully updated",
          attribute: req.params.attr,
        };
        return res.status(200).json(msg);}
      }
    );
    });

      router.route("/delattribute/:email/:attr").get( (req, res) => {
        //finding the profile data of the user from mongodb database
        DUser.findOneAndUpdate( // to find the user and update the password from the collections
        { email: req.params.email },//user name remains the same
       { $pull: { attribute: req.params.attr  } 
        // password is set from the postman body
       },{ new: true },
        (err, result) => {
          if (err) return res.json({ msg: err });
          else{
          const msg = {
            msg: "Attribute deleted success fully",
           
          };
          return res.status(200).json(msg);}
        }
      );});
      router.route("/update/:username").patch( (req, res) => {
        //using patch method to update password
        console.log(req.params.username,"function calling");
           User.findOneAndUpdate( // to find the user and update the password from the collections
          { username: req.params.username },//user name remains the same
          { $set: { password: req.body.password },
          // password is set from the postman body
         },{ new: true },
          (err, result) => {
          
            if (err) return res.json({ msg: err });
            else{
            const msg = {
              msg: "password successfully updated",
              username: req.params.username,
            };
            return res.status(200).json(msg);}
          }
        );
    
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
    await DUser.findOneAndUpdate(
     
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


  router.route("/deletephoto").delete(middleware.checkToken, (req, res) => {
    DUser.findOne(
      { _id: req.decoded.id }
      ,
      (err, result) => {
        if (err) {console.log("deleted"); return res.json(err);}
        else if (result) {
          console.log(result);
          const deleteFile = "uploads/"+result["username"]+".jpg";
          console.log(deleteFile);
          if (fs.existsSync(deleteFile)) {
            fs.unlink(deleteFile, (err) => {
                if (err) {
                    console.log(err);
                  }
                console.log('Image deleted');
                //making the changes in profile
                Profile.findOneAndUpdate(
                  { username: req.decoded.username },
                  {
                    $set: {
                      img:""
                    },
                  },
                  { new: true },
                  (err, result) => {
                    if (err) console.log("Error Updating");
                    if (result == null)  console.log("Profile data not found");
                    else  console.log("Img updated to Null");
                  }
                );
                 })
          }
          console.log(result);
          return res.status(200).json("Blog deleted");
        }
        else{
        return res.json("Blog not deleted");}
      }
    );
  });

  module.exports = router