
document.onload = Start()
var now;
var loaded = false;

var player;

function Start() {
    if (document.title != "Playlist") {
        LoopQueue()
        onYouTubeIframeAPIReady() //failsafe in case it's not being called
        if (document.title == "Music Player")
            GenerateQR()
    } else {
        let page = document.getElementsByClassName("PlaylistInfo")[0];
        GetURL(ApiUrl + "playlist" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data) {
            data = JSON.parse(data);
            
            page.style["margin-left"] = "20px"

            if (("success" in data)) {
                document.location.pathname = "/MusicQ/Room/"
                return;
            }
            Showqueue(data.items, true)

            GetURL(ApiUrl + "checkplaylist" + `?playlistId=${data.items[0].playlistId}`).then(function (_data) {
                _data = JSON.parse(_data);
                console.log(_data)
                let playlistImg = document.createElement("img");
                let playlistTitle = document.createElement("h3");

                playlistImg.setAttribute("alt", _data.title);
                playlistImg.src = _data.playlist.thumbnails.default.url;

                playlistTitle.innerText = _data.playlist.title;

                page.appendChild(playlistTitle);
               // page.appendChild(document.createElement("br"));
               // page.appendChild(playlistImg);

                
               /// page.appendChild(document.createElement("br"));

                let plLength = document.createElement("b");
                plLength.innerText = "Videos: " + data.pageInfo.totalResults;
               // page.appendChild(plLength);
            });
        });
    }
}

function onYouTubeIframeAPIReady() {
    if (loaded === true) return;
    loaded = true;

    console.log("Ready");
    GetURL(ApiUrl + "current" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data) {
        data = JSON.parse(data);

        if (("success" in data)) {
            document.location.pathname = "/MusicQ/Room/"
            return;
        }

        if (data.current !== undefined && data.current.id !== undefined) {
            let title = document.getElementById("vidTitle");
            title.textContent = data.current.title;
            CreatePlayer(data.current.id);
        } else {
            GetURL(ApiUrl + "next" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data2) {
                data2 = JSON.parse(data2);

                let title = document.getElementById("vidTitle");
                title.textContent = data2.current.title;
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

function GenerateQR() {
    let qr_size = 160;
    let destination = document.location.href.replace("/player", "");
    var qrcode = new QRCode("qrcode", {
        text: destination,
        width: qr_size,
        height: qr_size,
        colorDark: "#000000",
        colorLight: "#ffffff00"
    });
    var qr = document.getElementById("qrcode")
    qr.addEventListener("click", function () {
        window.open(destination, '_blank');
    }, false);
    qr.style.cursor = "pointer";
}

function NextVideo() {
    GetURL(ApiUrl + "next" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data) {
        data = JSON.parse(data);

        if (("success" in data)) {
            document.location.pathname = "/MusicQ/Room/"
            return;
        }

        console.log("end");
        if (data.current !== undefined) {
            let title = document.getElementById("vidTitle");
            title.textContent = data.current.title;
            ChangeVid(data.current.id);
        }
    });
}

function PreviousVideo() {
    GetURL(ApiUrl + "prev" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data) {
        data = JSON.parse(data);

        if (("success" in data)) {
            document.location.pathname = "/MusicQ/Room/"
            return;
        }

        console.log("back");

        if (data.previous[0] == data.Old) {
            tempAlert("No more videos", 2000)
            if (player !== undefined)
                player.seekTo(0)
        } else
            if (data.previous[0] !== undefined) {
                let title = document.getElementById("vidTitle");
                title.textContent = data.previous[0].title;
                ChangeVid(data.previous[0].id);
            }
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
    GetURL(ApiUrl + "current" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data) {
        data = JSON.parse(data);

        if (("success" in data)) {
            document.location.pathname = "/MusicQ/Room/"
            return;
        } else {
            now = data;
            Showqueue(data.queue);
        }
    })
}

let keepAlive;
function KeepAlive(_keep) {
    keep = _keep;
    let refreshMinutes = 5;
    let refreshTime = (refreshMinutes * 1000) * 60//;300000;//every 5 minutes
    if (keep) {
        keepAlive = setInterval(function () {
            console.log("Keeping alive")
            if (keep == true) {
                GetURL(ApiUrl + "rooms").then(function (data) {
                    data = JSON.parse(data);
                })
            }
        }, refreshTime)
        return `KeepAlive enabled (refreshing every ${(refreshTime / 1000) / 60} minutes)`
    } else {
        if (keepAlive)
            clearInterval(keepAlive)
        return "KeepAlive disabled"
    }
}

function Showqueue(vids, showimgs = false) {

    var table = document.getElementsByClassName("responsive-table");
    table = table[0];
    RemoveChildren(table)
    for (let i = 0; i < vids.length; i++) {
        var row = document.createElement("li");
        var cell1 = document.createElement("div")
        if (showimgs) var cell2 = document.createElement("img")//
        var cell3 = document.createElement("div")

        var anchor = document.createElement("a")
        row.appendChild(anchor);

        cell1.innerHTML = "<b>" + vids[i].title + "</b>";
        if (showimgs) cell2.src = vids[i].thumbnails.default.url;//vids[i][`thumbnails[default][url]`]//
        cell3.innerHTML = vids[i].channelTitle;


        anchor.setAttribute("name", vids[i].id);
        row.className = "table-row";
        cell1.className = "col col-1";
        if (showimgs) cell2.className = "col col-2";//
        cell3.className = "col col-3";

        row.appendChild(cell1);
        if (showimgs) row.appendChild(cell2);//
        row.appendChild(cell3);
        table.appendChild(row);
    }
}

function tempAlert(msg, duration) {
    var el = document.createElement("div");
    el.setAttribute("style", "position:absolute;top:40%;left:20%;background-color:white;");
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
}