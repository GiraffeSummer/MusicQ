window.onload = Start();

let currentRooms;

function Start() {
    if (document.title == "Room Picker") {
        LoopRooms();
        setInterval(LoopRooms, 1000);
    }
}

function LoopRooms() {
    GetURL(ApiUrl + "rooms").then(function (data) {
        data = JSON.parse(data);
        if (currentRooms == undefined || JSON.stringify(currentRooms) != JSON.stringify(data)) {
            currentRooms = data;
            ShowRooms(data);
        }
    })
}

function ClickCreateRoom() {
    document.location.pathname = "/MusicQ/Room/Create.html";
}

function CheckPlaylist() {
    console.log("checking playlist");
    let playlist = document.getElementById("roomPlaylist");
    let playId = (getParameterByName("list", playlist.value)) ? getParameterByName("list", playlist.value) : encodeURI(playlist.value);
    GetURL(ApiUrl + "checkplaylist" + `?playlistId=${playId}`).then(function (data) {
        data = JSON.parse(data);

        if (data.valid) {
            alert(`Playlist found: ${data.playlist.title}`);
        }
        else {
            alert("No playlist found (make sure the playlist privacy is unlisted or public, not private!)");
        }
    });
}

function CreateRoom() {
    if (document.title == "Room Picker") return;

    let name = document.getElementById("roomName").value;
    if (name.length < 1) {
        alert("Please enter a name!")
        return;
    }
    let pass = document.getElementById("roomPass").value;
    let playlist = document.getElementById("roomPlaylist");
    let listed = (document.getElementById("roomListed")) ? document.getElementById("roomListed").checked : true;
    // console.log(playlist.value)
    let p_id = (getParameterByName("list", playlist.value)) ? getParameterByName("list", playlist.value) : playlist.value;
    let playId = p_id;

    GetURL(ApiUrl + "checkplaylist" + `?playlistId=${playId}`).then(function (data) {
        data = JSON.parse(data);

        let newRoom = {
            name: name,
            password: pass,
            playlistId: playId,
            listed: listed
        }

        if (data.valid || playlist.value == "") {
           // alert(`Playlist found: ${data.playlist.title}`);
            if (document.getElementById("thumbnail")) {
                ImageGetExample((d) => {
                    if (d.image)
                        newRoom.image = d.image;
                    PostNewRoom(newRoom)
                });
            } else PostNewRoom(newRoom)
        }
        else {
            //alert("No playlist found (make sure the playlist privacy is unlisted or public, not private!)");
            alert("Playlist not valid.\nPlease enter a proper playlist URL or ID.\nLeave it blank for the default one.")
            playlist.value = "";
        }
    });
    function PostNewRoom(newRoom) {
        //console.log(newRoom)
        Post(newRoom, ApiUrl + "new").then(function (data) {
            //console.log(data)
            document.location = updateQueryParameter(ApiUrl + "MusicQ/player/", "id", data.id);
        })
    }
}

function JoinRoom(room) {
    if (room.password == "") {
        GotoRoom();
    } else {
        let pass = window.prompt("Enter room Password: ", "")
        if (room.password == pass) {
            GotoRoom();
        } else alert("Wrong Password")
    }

    function GotoRoom() {
        document.location = updateQueryParameter(ApiUrl + "MusicQ/", "id", room.id)
    }
}

function ShowRooms(rooms) {

    var obj = {
        name: "",
        id: 0,
        password: "",
        playlistId: "",
        current: "",
        listed: false
    };

    var table = document.getElementsByClassName("responsive-table");
    table = table[0];
    RemoveChildren(table)
    for (let i = 0; i < rooms.length; i++) {
        if (!rooms[i].listed) continue
        var row = document.createElement("li");
        var cell1 = document.createElement("div").appendChild(document.createElement("b"))
        var cell2 = document.createElement("img")//
        var cell3 = document.createElement("div")

        var anchor = document.createElement("a")
        anchor.setAttribute("name", rooms[i].id);

        (rooms[i].password !== "") ?
            cell1.textContent = "🔒 " + rooms[i].name + "" :
            cell1.textContent = "" + rooms[i].name + "";
        //cell1.textContent += "&nbsp; - &nbsp;\nRoom id: " + rooms[i].id;

        if (!rooms[i].image) {
            if (rooms[i].current && rooms[i].current.thumbnails)
                cell2.src = rooms[i].current.thumbnails.default.url//
        } else
            cell2.src = rooms[i].image;



        cell3.textContent = rooms[i].current.title;


        row.addEventListener("click", function () {
            JoinRoom(rooms[i]);
        }, false);


        row.className = "table-row";
        cell1.className = "col col-1";
        cell2.className = "col col-2 roomImg";//
        cell3.className = "col col-3";

        row.appendChild(cell1);
        row.appendChild(anchor);
        row.appendChild(cell2);//
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

//input the image node Object
function ImgtoString(img, callback) {
    var reader = new FileReader();

    reader.addEventListener("load", function (d) {
        let imgData = d.target.result;
        let size = 4 * (imgData.toString().length / 3);
        let imgObj = { size: (size / 1000).toFixed(2) + "kb", image: imgData.toString(), rawSize: size };
        callback(imgObj);
    });

    reader.readAsDataURL(img)
}
var maxImgSize = 150000;
function ImageGetExample(callback) {
    //<input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg">
    let img = document.getElementById("thumbnail");

    if (img.files.length <= 0) callback({ image: undefined });
    ImgtoString(img.files[0], (d) => {
        if (d.rawSize > maxImgSize) {
            alert(`File too big (${d.size} max: ${maxImgSize / 1000}kb)`);
            img.value = "";
        } else
            callback(d);
    })
}

function CheckImageFile() {
    let img = document.getElementById("thumbnail");
    ImgtoString(img.files[0], (d) => {
        if (d.rawSize > maxImgSize) {
            alert(`File too big (${d.size} max: ${maxImgSize / 1000}kb)`);
            img.value = "";
        }
    })
}