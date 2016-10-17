
/*************************************************************
 * Final Implementation of Node.js Server Side Javascript Code
 * 
 * 
 * 
 * *********************************************************/



var express = require("express");
var app = express();
var cors = require('cors');

var mysql = require("mysql");
var bodyParser = require('body-parser');

app.use(cors());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
//app.engine("handlebars", handlebars.engine);
//app.set('view engine', 'handlebars');
app.set('port', 3211);

var pool = mysql.createPool({
    host: 'localhost',
    user: 'student',
    password: 'default',
    database: 'student'
})



/**
pool.query("DROP TABLE IF EXISTS locations", function(err){
        pool.query("CREATE TABLE locations("+
            "location_id VARCHAR(255) PRIMARY KEY NOT NULL," +
            "tipping BOOLEAN NOT NULL)");
});
**/


pool.query("CREATE TABLE IF NOT EXISTS locations("+
            "location_id VARCHAR(255) PRIMARY KEY NOT NULL," +
            "tipping BOOLEAN NOT NULL)"
);



// routes
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});





app.post("/add", function(req,res){

    pool.query("INSERT INTO locations SET ?", req.body, function(err, result){
        if (err){
            res.send(err);
        } else {
            res.send(result);
        }
        console.log(result);
        console.log(err);
        });
});

app.get("/show", function(req,res){

	pool.query("SELECT * FROM locations", function(err,rows,fields){
		if(err){
			next(err);
			return;
		}
		res.send(JSON.stringify(rows));
	});
});




app.post('/remove', function(req,res,next){
    console.log(req.body);
    pool.query("DELETE FROM locations WHERE location_id=?", req.body.location_id, function(err, result){
        if (err){
            res.send(err);
        } else {
            res.send(result);
        }
    })

});



app.post('/show_tip', function(req,res,next){
    pool.query("SELECT tipping FROM locations WHERE location_id=?", req.body.location_id, function(err, rows, fields){
        
	var tipping = {value : null};
	
	if (err){
            res.send(err);
        } else {
        	
		console.log(rows.length);
		
		if (rows.length != 0){
			tipping.value = rows[0].tipping;
			res.send(JSON.stringify(tipping));
		}
		else{ 
			res.send(JSON.stringify(tipping));	
		}

	
        }

    })
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
