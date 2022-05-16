var mongoclient = require('mongodb').MongoClient
const { response } = require("express")
var express = require('express')
var http = require('http')
var jwt = require("jsonwebtoken")
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express()
app.use(bodyParser.json())
app.use(cors());
// app.use(express.urlencoded({extended:true}))

mongoclient.connect("mongodb://localhost:27017", (err, client) => {
    if (err) {
        console.log("error")
    }
    else {
        console.log("connection established")
        db = client.db('empdb')
    }
})

app.get("/index.html", (req, res) => {
    res.sendFile('./auth.html', { root: __dirname });
})
app.get('/emps', (req, res) => {
    db.collection('emp').find().toArray((arr, items) => {
        res.write(JSON.stringify(items))
        res.end();
    })
})
app.post('/addemp', (req, res) => {
    console.log(req.body);
    const user = {
        _id: parseInt(req.body._id),
        name: req.body.name,
        gender: req.body.gender
    }
    console.log(user)
    db.collection('emp').insertOne(user)
    console.log("success")
    res.end()
})
app.put('/updateemp/:id', (req, res) => {
    var id = parseInt(req.params.id)
    db.collection('emp').updateOne({ "_id": id }, { $set: { gender: req.body.gender } });
    res.end();
})
app.delete("/deleteemp/:id", (req, res) => {
    var id = parseInt(req.params.id)
    db.collection('emp').deleteOne({ "_id": id })
    res.end("deleted")
})
app.get('/emps/:id', verifyToken, (req, res) => {
    var id = parseInt(req.params.id)
    db.collection('emp').find({ _id: id }).toArray((err, items) => {
        res.write(JSON.stringify(items))
        res.end();
    })

})
app.post('/login', (req, res) => {
    let uname = req.body.username
    let pwd = req.body.password
    db.collection('users').find({ "username": uname, "password": pwd }).toArray((err, result) => {
        console.log(result)
        if (result.length != 0) {
            jwt.sign({ "username": uname }, "cvrcollege", (err, token) => {
                if (!err) {
                    res.json({
                        "success": true,
                        "message": "athentication sucess",
                        "token": token
                    })
                }
            })
        }
        else {
            res.json({
                "success": false,
                "message": 'Authentication failed'
            })
        }
    })
})

function verifyToken(req, res, next) {
    let token = req.headers["authorization"]
    if (token) {
        token = token.split(' ')[1]
        console.log(token)
        jwt.verify(token, "cvrcollege", (err, decoded) => {
            if (err) {
                return res.json({
                    sucess: false,
                    message: "Token is not valid"
                });
                console.log(err)
            }
            else {
                next();
            }
        })
    }
    else {
        return res.json({ success: false, message: "a token is reqd for authentication" })
    }
}


app.listen(2000, () => {
    console.log("server started")
})