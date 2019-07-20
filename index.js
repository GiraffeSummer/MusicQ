//const request = require('request');
var yt = require('./youtubeWrapper');
const express = require('express')
const bodyParser = require('body-parser');
var auth;
const app = express()

//var playlistID = "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";  //default random playlist change to your liking
const defaultPlaylist = "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj"; //default random playlist change to your liking
var port;


var players = {}
var player = {
    name: "",
    id: 0,
    password: "",
    playlistId: "",
    timestamp: 0,
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


try {


    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(function (req, res, nextt) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        nextt();
    });


    app.get('/', function (req, res) { res.redirect('/MusicQ/Room'); })

    app.get('/next', function (req, res) {

        if (!("id" in req.query && players[req.query.id])) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false }));
            res.end();
            return;
        }


        let id = req.query.id;

        let now = Math.round(Date.now() / 1000);
        players[id].timestamp = now;

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
                if (data.items === undefined) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send({ current: { title: "Wrong playlist (private don't work)", id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } });
                    res.end();
                    console.log("invalid playlist");
                    return;
                }
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

    app.get('/rooms', function (req, res) {
        GenerateRoomList(ReturnObj);

        function ReturnObj(ret) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(ret));
            res.end();
        }
    })


    function GenerateRoomList(callback) {
        var rooms = [];
        var obj = {
            name: "",
            id: 0,
            password: "",
            playlistId: "",
            current: ""
        };
        for (let index = 0; index < Object.keys(players).length; index++) {
            let o = JSON.parse(JSON.stringify(obj));

            o.name = players[Object.keys(players)[index]].name;
            o.id = players[Object.keys(players)[index]].id;
            o.password = players[Object.keys(players)[index]].password;
            o.playlistId = players[Object.keys(players)[index]].playlistId;
            o.current = players[Object.keys(players)[index]].np;
            rooms.push(o);
        }
        callback(rooms);
    }



    app.post('/new', function (req, res) {
        var body = req.body;

        let obj = JSON.parse(JSON.stringify(player));
        let now = Math.round(Date.now() / 1000);
        obj.name = body.name;
        obj.playlistId = (body.playlistId !== undefined && body.playlistId !== "undefined") ? body.playlistId : defaultPlaylist;
        obj.id = GenerateId();
        obj.password = body.password;
        obj.timestamp = now;

        players[obj.id] = obj;
        console.log(`New Room: ${obj.name} - "${obj.password}" - ${obj.id}`)

        res.setHeader('Content-Type', 'application/json');
        res.send(obj);
        res.end();
    })


    app.post('/search', function (req, res) {
        var body = req.body;
        let title = body.title;
        console.log(`Search: ` + title);
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

        let now = Math.round(Date.now() / 1000);
        players[id].timestamp = now;

        players[id].queue.push(body);
        AddObjs(body);

        function AddObjs(o) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(o));
            res.end();
        }
    })

    app.get('/playlist', function (req, res) {
        if (!("id" in req.query && players[req.query.id])) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false }));
            res.end();
            return;
        }

        let id = req.query.id;

        yt.GetPlaylist({ playlistId: players[id].playlistId, key: auth.youtube, maxResults: 50 }).then(function (data) {
            if (data.items === undefined) {
                res.setHeader('Content-Type', 'application/json');
                res.send({ current: { title: "Wrong playlist (private don't work)", id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } });
                res.end();
                console.log("invalid playlist");
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
            res.end();
        })
    })


    app.listen(port, function () {
        console.log(`Music listening on port ${port}!`)
        setInterval(PurgeRooms, 36000000)//36000000
    })

    function PurgeRooms() {
        let compare = 36000;
        let now = Math.round(Date.now() / 1000);
        for (let index = 0; index < Object.keys(players).length; index++) {
            if ((now - compare) >= players[Object.keys(players)[index]].timestamp) {
                console.log(`Out of time: ${players[Object.keys(players)[index]].name}`);
                delete players[Object.keys(players)[index]]
            }
            //players[Object.keys(players)[index]].name;
        }
    }

    function ShiftSong(id) {
        if (!(Object.entries(players[id].np).length === 0 && players[id].np.constructor === Object))//check if object is not empty
            players[id].previous.unshift(players[id].np);
        players[id].np = players[id].queue.shift();
        let now = Math.round(Date.now() / 1000);
        players[id].timestamp = now;
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
} catch (error) {
    const fs = require('fs')

    var date = new Date();
    fs.writeFileSync(`./errors/${date.toDateString()}.txt`, error);

    function SaveJson(json, location) {
        let data = JSON.stringify(json, null, 4);
        fs.writeFileSync(location, data);
    }
}