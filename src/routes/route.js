const express = require('express')
const router = express.Router() 
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController")
const middleware = require('../middleware/auth')
const reviewController = require("../controllers/reviewController")
const aws= require("aws-sdk")

/*------------------------Create User----------------------------------*/
router.post("/register", userController.createUser);

/*------------------------User Login-----------------------------------*/
router.post("/login", userController.login);

/*---------------------------Book Create ------------------------------*/
router.post("/createbook" , middleware.authenticate ,bookController.createBook)

/*------------------------Fetch Books----------------------------------*/
router.get("/books", middleware.authenticate, bookController.allBooks);

/*------------------------Fetch Books(path params)---------------------*/
router.get("/books/:bookId", middleware.authenticate, bookController.getBooksById);

/*-------------------------UPDATE BOOKS--------------------------------*/
router.put("/books/:bookId" , middleware.authenticate, middleware.authorization, bookController.updatebook)

/*-----------------------delete Book-----------------------------------*/
router.delete("/books/:bookId", middleware.authenticate, middleware.authorization ,bookController.deleteBook);

/*------------------------Create Review--------------------------------*/
router.post("/books/:bookId/review", reviewController.createReview);

/*------------------------Update Review--------------------------------*/
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview);

/*------------------------Delete Review--------------------------------*/
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);


// -------------------- AWS -----------------------------
aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})

/*---------------------------Hit On Wrong Url -------------------------*/
router.all("/*", function(req, res){
    return res.status(404).send({status:false, message : "Provided route url is wrong"})
})

module.exports = router
