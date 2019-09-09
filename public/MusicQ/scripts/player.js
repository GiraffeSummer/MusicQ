
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
        GetURL(ApiUrl + "playlist" + `${(getParameterByName("id") !== null) ? `?id=${getParameterByName("id")}` : ""}`).then(function (data) {
            data = JSON.parse(data);
            console.log(data)
            if (("success" in data)) {
                document.location.pathname = "/MusicQ/Room/"
                return;
            }
            console.log(data.items)
            Showqueue(data.items, true)
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

function KeepAlive(_keep) {
    keep = _keep;
    if (keep) {
        let keepAlive = setInterval(function () {
            console.log("loop")
            if (keep == true) {
                GetURL(ApiUrl + "rooms").then(function (data) {
                    data = JSON.parse(data);
                })
            } else {
                clearInterval(keepAlive)
            }
        }, 300000) //every 5 minutes
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