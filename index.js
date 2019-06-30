//const request = require('request');
var yt = require('./youtubeWrapper');
const express = require('express')
const bodyParser = require('body-parser');
var auth;
const app = express()

//var playlistID = "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";  //default random playlist change to your liking

var port;

var players = {}
var player = {
    name: "",
    id: 0,
    playlistId: "",
    np: {},
    queue: [],
    previous: []
}

try {
    auth = require('./auth.json');
    baseUrl = auth.url;
    // playlistID = auth.playlist;
    port = 8082;
} catch (error) {
    console.log(error)
    auth = { youtube: process.env.yt }
    port = process.env.PORT;
    // playlistID = process.env.playlist
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, nextt) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    nextt();
});


app.get('/', function (req, res) { res.redirect('/MusicQ'); })


app.get('/next', function (req, res) {

    if (!("id" in req.query && players[req.query.id])) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ success: false }));
        res.end();
        return;
    }


    let id = req.query.id;

    if (players[id].queue.length >= 1) {
        let ret = {
            Old: players[id].np,
            current: players[id].queue[0],
            queue: players[id].queue,
            previous: players[id].previous
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(ret);
        res.end();
        ShiftSong(id);
    } else {
        //no new songs, find in playlist


        yt.GetPlaylist({ playlistId: players[id].playlistId, key: auth.youtube, maxResults: 50 }).then(function (data) {

            players[id].queue.push(data.items[Random(data.items.length)]);
            let ret = {
                Old: players[id].np,
                current: players[id].queue[0],
                queue: players[id].queue,
                previous: players[id].previous
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(ret);
            res.end();
            ShiftSong(id);
        })
    }
})

app.get('/current', function (req, res) {
    if ("id" in req.query && players[req.query.id]) {
        let id = req.query.id;

        let ret = {
            current: players[id].np,
            queue: players[id].queue,
            previous: players[id].previous
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(ret));
        res.end();

    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ success: false }));
        res.end();
    }


})


app.post('/new', function (req, res) {
    var body = req.body;

    let obj = JSON.parse(JSON.stringify(player));
    obj.name = body.name;
    obj.playlistId = body.playlistId;
    obj.id = GenerateId();

    players[obj.id] = obj;
    console.log(obj)

    res.setHeader('Content-Type', 'application/json');
    res.send(obj);
    res.end();
})


app.post('/search', function (req, res) {
    var body = req.body;
    let title = body.title;
    console.log(title);
    yt.Search({ q: title, maxResults: 25, key: auth.youtube, type: "video", videoEmbeddable: "true", videoSyndicated: "any" }).then(AddObjs).catch(function (e) { console.log(e) })

    function AddObjs(o) {
        res.setHeader('Content-Type', 'application/json');
        res.send(o);
        res.end();
    }
})


app.post('/add', function (req, res) {
    let id = req.query.id;
    var body = req.body;

    if (!("id" in req.query && players[req.query.id])) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ success: false }));
        res.end();
        return;
    }


    players[id].queue.push(body);
    AddObjs(body);

    function AddObjs(o) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(o));
        res.end();
    }
})


app.listen(port, function () {
    console.log(`Music listening on port ${port}!`)
})

function ShiftSong(id) {
    if (!(Object.entries(players[id].np).length === 0 && players[id].np.constructor === Object))//check if object is not empty
        players[id].previous.unshift(players[id].np);
    players[id].np = players[id].queue.shift();
}

function Random(max) { return (Math.floor(Math.random() * max)); }

function GenerateId() {
    length = 8;
    timestamp = +new Date;
    var ts = timestamp.toString();
    var parts = ts.split("").reverse();
    var id = "";

    for (var i = 0; i < length; ++i) {
        var index = _getRandomInt(0, parts.length - 1);
        id += parts[index];
    }

    return id;

}
var _getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
