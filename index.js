//const request = require('request');
var yt = require('./youtubeWrapper');
const express = require('express')
const bodyParser = require('body-parser');
var auth;
const app = express()

var playlistID = "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";  //default random playlist change to your liking

var port;

try {
    auth = require('./auth.json');
    baseUrl = auth.url;
    playlistID = auth.playlist;
    port = 8082;
} catch (error) {
    console.log(error)
    auth = { youtube: process.env.yt }
    port = process.env.PORT;
    playlistID = process.env.playlist
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
    if (player.queue.length >= 1) {
        let ret = {
            Old: player.np,
            current: player.queue[0],
            queue: player.queue,
            previous: player.previous
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(ret);
        res.end();
        ShiftSong();
    } else {
        //no new songs, find in playlist


        yt.GetPlaylist({ playlistId: playlistID, key: auth.youtube }).then(function (data) {

            player.queue.push(data.items[Random(data.items.length)]);
            let ret = {
                Old: player.np,
                current: player.queue[0],
                queue: player.queue,
                previous: player.previous
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(ret);
            res.end();
            ShiftSong();
        })
    }
})

app.get('/current', function (req, res) {
    let ret = {
        current: player.np,
        queue: player.queue,
        previous: player.previous
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(ret));
    res.end();
})



app.post('/search', function (req, res) {
    var body = req.body;
    let title = body.title;
    console.log(title);
    yt.Search({ q: title, maxResults: 25, key: auth.youtube, type: "video", videoEmbeddable: "true", videoSyndicated: "true" }).then(AddObjs).catch(function (e) { console.log(e) })

    function AddObjs(o) {
        res.setHeader('Content-Type', 'application/json');
        res.send(o);
        res.end();
    }
})


app.post('/add', function (req, res) {
    var body = req.body;
    player.queue.push(body);
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


var player = {
    np: {},
    queue: [],
    previous: []
}

function ShiftSong() {
    if (!(Object.entries(player.np).length === 0 && player.np.constructor === Object))//check if object is not empty
        player.previous.unshift(player.np);
    player.np = player.queue.shift();
}

function Random(max) { return (Math.floor(Math.random() * max)); }