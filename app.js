var express=require("express"); 
var bodyParser=require("body-parser"); 
var fs = require('fs');
const multer = require('multer');
let cookieParser = require('cookie-parser');
const alert=require('alert-node');

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
app.use(cookieParser()); 
app.use(bodyParser.json()); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
	extended: true
})); 


//Cookie Management.
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {
    // no: set a new cookie on client machine
    //set cookie value to 1 as this is first visit of user.
    var randomNumber=1;
    res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  } 
  else
  {
    // yes, cookie was already present 
    var cnt = req.cookies.cookieName;
    //convert count to Number and incraese it by 1.
    var integer = Number(cnt);
    integer+=1;
    //console.log('inter:',integer);
    res.cookie('cookieName',integer, { maxAge: 900000, httpOnly: true });

    console.log('cookie exists', integer);
    //Display alert box as total number of visits of user to website.
    alert("Total Website count by You:"+integer);
 
  } 
  //after setting the cookie, continue the execution.
	next();  
});




//Calling the index.html after hitting the server.
app.get('/',function(req,res){ 
res.set({ 
	'Access-control-Allow-Origin': '*'
	}); 
//index.html is present in root directoty and then inside the parent directory
 res.sendFile(__dirname + './public/index.html');

 res.cookie("userData", users); 
 res.send(req.cookies);

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


console.log("server listening"); 
