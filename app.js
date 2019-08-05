var express=require("express"); 
var bodyParser=require("body-parser"); 
var fs = require('fs');
const multer = require('multer');

//Database Connectivity.
const mongoose = require('mongoose'); 
//mongoose.connect('mongodb://localhost:27017/user');  
mongoose.connect('mongodb+srv://ayyaz:ayyaz@cluster0-rtzsv.mongodb.net/test?retryWrites=true&w=majority');

var db=mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
	console.log("connection succeeded"); 
}) 

var app=express() 

app.use(bodyParser.json()); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
	extended: true
})); 

//Calling the index.html after hitting the server.
app.get('/',function(req,res){ 
res.set({ 
	'Access-control-Allow-Origin': '*'
	}); 
 res.sendFile(__dirname + './public/index.html');
}).listen(process.env.PORT) 


//Storage Setting
//Change the file name with appending the current timestamp.
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })


//Handling post request, adding the data as object to mongoDB.

app.post('/uploadfile',upload.single('myFile'), function(req,res,next){ 

	 const file = req.file;
  	if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  	}
    //res.send(file)

	var name = req.body.name; 
	var email =req.body.email; 
	var jobid = req.body.jobid; 
	var phone =req.body.phone; 

	//res.send("hello  $(name)");

	var data = { 
		"name": name, 
		"email":email, 
		"jobid":jobid, 
		"phone":phone, 
		"myFile":file
	} 
	//we can also print data which is being added to DB using below commented line.
	//res.json(data); 
db.collection('details').insertOne(data,function(err, collection){ 
		if (err) throw err; 
		console.log("Record inserted Successfully"); 
			
	}); 
		
	//Calling the html file for success message.
	return res.redirect('signup_success.html'); 
}) 


console.log("server listening at port 3000"); 
