var yt = require('./youtubeWrapper');
const express = require('express')
const bodyParser = require('body-parser');
var auth;
const app = express()

const defaultPlaylist = "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj"; //default random playlist change to your liking
var port;


var players = {}
var player = {
    name: "",
    id: 0,
    password: "",
    playlistId: "",
    timestamp: 0,
    image: undefined,
    np: {},
    queue: [],
    previous: []
}

try {
    auth = require('./auth.json');
    baseUrl = auth.url;
    port = 8082;
} catch (error) {
    console.log(error)
    auth = { youtube: process.env.yt }
    port = process.env.PORT;
}


try {
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false , limit: "140kb"}));

    app.use(function (req, res, nextt) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        nextt();
    });

    app.get('/', function (req, res) { res.redirect('/MusicQ/Home'); })
    app.get('/MusicQ/', function (req, res) { res.redirect('/MusicQ/Home'); })

    app.get('/next', function (req, res) {

        if (!("id" in req.query && players[req.query.id])) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false, message: "room doesn't exist" }));
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


    app.get('/prev', function (req, res) {
        if (!("id" in req.query && players[req.query.id])) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false, message: "room doesn't exist" }));
            res.end();
            return;
        }

        let id = req.query.id;

        let now = Math.round(Date.now() / 1000);
        players[id].timestamp = now;

        if (players[id].previous.length >= 1) {
            let ret = {
                Old: players[id].np,
                current: players[id].queue[0],
                queue: players[id].queue,
                previous: players[id].previous
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(ret);
            res.end();
            UnShiftSong(id);
        } else {
            //no old songs
            let ret = {
                Old: players[id].previous[0],
                current: players[id].np,
                queue: players[id].queue,
                previous: players[id].previous
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(ret);
            res.end();
            UnShiftSong(id);
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
            res.send(JSON.stringify({ success: false, message: "room doesn't exist" }));
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
        let rooms = [];
        let obj = {
            name: "",
            id: 0,
            password: "",
            playlistId: "",
            current: "",
            image: undefined
        };

        for (let index = 0; index < Object.keys(players).length; index++) {
            let o = JSON.parse(JSON.stringify(obj));

            o.name = players[Object.keys(players)[index]].name;
            o.id = players[Object.keys(players)[index]].id;
            o.password = players[Object.keys(players)[index]].password;
            o.playlistId = players[Object.keys(players)[index]].playlistId;
            o.current = players[Object.keys(players)[index]].np;
            o.image = players[Object.keys(players)[index]].image;
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
        let _id = GenerateId();

        //making sure no duplicate id will be generated
        while (_id in players) _id = GenerateId(); //Will most likely not run (because no duplicate was generated)

        obj.id = _id;
        obj.password = body.password;
        obj.timestamp = now;

        obj.image = (body.image) ? body.image : undefined;

        players[obj.id] = obj;
        console.log(`New Room: ${obj.name} - "${obj.password}" - ${obj.id}`)

        res.setHeader('Content-Type', 'application/json');
        res.send(obj);
        res.end();
    })

    app.get('/checkplaylist', function (req, res) {
        let playlistId = req.query.playlistId;
        yt.GetPlaylistInfo({ playlistId: playlistId, key: auth.youtube, maxResults: 1 }).then(function (data) {

            let pl;
            if (data && data.items.length > 0)
                pl = data.items[0].snippet;
            else pl = undefined;

            //console.log((pl) ? "playlist found: " + pl.title : "no playlist found");

            res.setHeader('Content-Type', 'application/json');
            res.send({ valid: (data && data.items.length > 0), used: playlistId, playlist: pl });
            res.end();
        })
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
            res.send(JSON.stringify({ success: false, message: "room doesn't exist" }));
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

    app.get('/keepalive', function (req, res) {
        if (!("id" in req.query && players[req.query.id])) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false, message: "room doesn't exist" }));
            res.end();
            return;
        }

        let id = req.query.id;

        let now = Math.round(Date.now() / 1000);
        players[id].timestamp = now;

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(players[id]));
        res.end();

    })

    app.get('/playlist', function (req, res) {
        if (!("id" in req.query && players[req.query.id])) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false, message: "room doesn't exist" }));
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
        setInterval(PurgeRooms, 3600000)//36000000 //for every 10 hours 1 hour inactive
    })
    //rn every 1 hour 10 hours inactive
    function PurgeRooms() {
        let compare = 36000;//36000 //for every 10 hours 1 hour inactive//compare is in SECONDS NOT miliseconds
        let now = Math.round(Date.now() / 1000);
        for (let index = 0; index < Object.keys(players).length; index++) {
            if (players[Object.keys(players)[index]].timestamp < (now - compare)) {
                console.log(`Out of time: ${players[Object.keys(players)[index]].name} - aged: ${new Date((now - players[Object.keys(players)[index]].timestamp) * 1000).toISOString().substr(11, 8)}`);
                delete players[Object.keys(players)[index]]
            }
        }
    }

    function ShiftSong(id) {
        if (!(Object.entries(players[id].np).length === 0 && players[id].np.constructor === Object))//check if object is not empty
            players[id].previous.unshift(players[id].np);
        players[id].np = players[id].queue.shift();
        let now = Math.round(Date.now() / 1000);
        players[id].timestamp = now;
    }

    function UnShiftSong(id) {
        if (players[id].previous.length >= 1) {
            if (!(Object.entries(players[id].np).length === 0 && players[id].np.constructor === Object))//check if object is not empty
                players[id].queue.unshift(players[id].np);
            players[id].np = players[id].previous.shift();
        }
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

    let date = new Date();
    fs.writeFileSync(`./errors/${date.toDateString()}.txt`, error);

    function SaveJson(json, location) {
        let data = JSON.stringify(json, null, 4);
        fs.writeFileSync(location, data);
    }
}

/* calculating time left
let now = Math.round(Date.now() / 1000);
o.timeLeft = `${new Date((players[Object.keys(players)[index]].timestamp - (now - 36000)) * 1000).toISOString().substr(11, 8)}`
*/