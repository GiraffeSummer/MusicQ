window.onload = Start();

function Start() {
    if (document.title == "Room Picker") {
        LoopRooms();
        setInterval(LoopRooms, 500);

    }
}

function LoopRooms() {
    GetURL(ApiUrl + "rooms").then(function (data) {
        data = JSON.parse(data);

        ShowRooms(data);
    })
}

function ClickCreateRoom() {
    document.location.pathname = "MusicQ/Room/Create.html";
}

function CreateRoom() {
    if (document.title == "Room Picker") return;

    let name = document.getElementById("roomName").value;
    let pass = document.getElementById("roomPass").value;
    let playlist = document.getElementById("roomPlaylist");
    // console.log(playlist.value)
    let playId = getParameterByName("list", playlist.value);
    //console.log(playId)
    let newRoom = {
        name: name,
        password: pass,
        playlistId: playId
    }

    //console.log(newRoom)
    Post(newRoom, ApiUrl + "new").then(function (data) {
        //console.log(data)
        document.location = updateQueryParameter(ApiUrl + "MusicQ/player/", "id", data.id);
    })
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
        document.location = updateQueryParameter(ApiUrl + "MusicQ/", "id", room.id);
    }
}

function ShowRooms(rooms) {

    var obj = {
        name: "",
        id: 0,
        password: "",
        playlistId: "",
        current: ""
    };

    var table = document.getElementsByClassName("responsive-table");
    table = table[0];
    RemoveChildren(table)
    for (let i = 0; i < rooms.length; i++) {
        var row = document.createElement("li");
        var cell1 = document.createElement("div")
        var cell2 = document.createElement("img")//
        var cell3 = document.createElement("div")

        var anchor = document.createElement("a")
        anchor.setAttribute("name", rooms[i].id);
        
        (rooms[i].password !== "") ?
            cell1.innerHTML = "🔒 <b>" + rooms[i].name + "</b>" :
            cell1.innerHTML = "<b>" + rooms[i].name + "</b>";
        //cell1.innerHTML += "&nbsp; - &nbsp;\nRoom id: " + rooms[i].id;

        if (rooms[i].current !== undefined && rooms[i].current.thumbnails !== undefined)
            cell2.src = rooms[i].current.thumbnails.default.url//
        cell3.textContent = rooms[i].current.title;


        row.addEventListener("click", function () {
            JoinRoom(rooms[i]);
        }, false);

        
        row.className = "table-row";
        cell1.className = "col col-1";
        cell2.className = "col col-2";//
        cell3.className = "col col-3";

        row.appendChild(cell1);
        row.appendChild(anchor);
        row.appendChild(cell2);//
        row.appendChild(cell3);
        table.appendChild(row);
    }
}