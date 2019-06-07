
document.onload = Start()
var now;
var loaded = false;

var player;

function Start() {
    LoopQueue()
}

function onYouTubeIframeAPIReady() {
    GetURL(ApiUrl + "current").then(function (data) {
        data = JSON.parse(data);

        if (data.current !== undefined && data.current.id !== undefined) {
            CreatePlayer(data.current.id);
        } else {
            GetURL(ApiUrl + "next").then(function (data2) {
                data2 = JSON.parse(data2);

                CreatePlayer(data2.current.id);
            });
        }
    });

    function CreatePlayer(_vidId) {
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: _vidId,
            playerVars: { 'autoplay': 1, 'controls': 1 },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        NextVideo();
    }
}

function NextVideo() {
    GetURL(ApiUrl + "next").then(function (data) {
        data = JSON.parse(data);
        console.log("end");
        if (data.current !== undefined)
            ChangeVid(data.current.id);
    });
}

function ChangeVid(id) {
    if (player !== undefined) {
        player.loadVideoById(id)
        player.playVideo();
    } else console.log("not an instance yet")
}

function LoopQueue() {
    setTimeout(LoopQueue, 500);

    GetURL(ApiUrl + "current").then(function (data) {
        data = JSON.parse(data);
        now = data;
        Showqueue(data.queue);
    })
}

function Showqueue(vids) {

    var table = document.getElementsByClassName("responsive-table");
    table = table[0];
    RemoveChildren(table)
    for (let i = 0; i < vids.length; i++) {

        var row = document.createElement("li");
        var cell1 = document.createElement("div")
        //   var cell2 = document.createElement("img")//
        var cell3 = document.createElement("div")

        var anchor = document.createElement("a")
        row.appendChild(anchor);

        cell1.innerHTML = "<b>" + vids[i].title + "</b>";
        //  cell2.src = vids[i][`thumbnails[default][url]`]//
        cell3.innerHTML = vids[i].channelTitle;


        anchor.setAttribute("name", vids[i].id);
        row.className = "table-row";
        cell1.className = "col col-1";
        //cell2.className = "col col-2";//
        cell3.className = "col col-3";

        row.appendChild(cell1);
        //  row.appendChild(cell2);//
        row.appendChild(cell3);
        table.appendChild(row);
    }
}