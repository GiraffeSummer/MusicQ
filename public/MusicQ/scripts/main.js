
var getUrl = window.location;
var ApiUrl = getUrl.protocol + "//" + getUrl.host + "/";


function SendData() {
    let q = document.getElementById("searchTag");
    var obj = { "title": q.value };
    Post(obj, ApiUrl + "search").then(function (d) {
        AddItems(d)
    });
}

function Post(data, url) {
    return new Promise(function (resolve, error) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(JSON_to_URLEncoded(data));
        xhr.onreadystatechange = back;
        function back(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(xhr.response));
            }
        }
    })
}

function GetURL(url) {
    return new Promise(function (resolve) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false); // false for synchronous request
        xmlHttp.send(null);
        resolve(xmlHttp.responseText);
    })
}

function AddItems(vids) {

    var table = document.getElementsByClassName("responsive-table");
    table = table[0];
    RemoveChildren(table)
    for (let i = 0; i < Object.keys(vids.items).length; i++) {

        var row = document.createElement("li");
        var cell1 = document.createElement("div")
        var cell2 = document.createElement("img")
        var cell3 = document.createElement("div")

        var anchor = document.createElement("a")
        row.appendChild(anchor);

        cell1.innerHTML = "<b>" + vids.items[i].title + "</b>";
        cell2.src = vids.items[i].thumbnails.default.url
        cell3.innerHTML = vids.items[i].channelTitle;

        cell2.setAttribute("width", "246px");
        cell2.setAttribute("height", "137.6px")

        row.addEventListener("click", function () {
            vidClicked(vids.items[i]);
        }, false);

        anchor.setAttribute("name", vids.items[i].id);
        row.className = "table-row";
        cell1.className = "col col-1";
        cell2.className = "col col-2";
        cell3.className = "col col-3";

        row.appendChild(cell1);
        row.appendChild(cell3);
        row.appendChild(cell2);
        table.appendChild(row);
    }
}

function vidClicked(vid) {
    console.log(vid.title);

    var obj = vid;
    Post(obj, ApiUrl + "add").then(function (d) {
        alert(d.title + " was added");
    });
}

function RemoveChildren(table) {
    var rows = table.getElementsByTagName("li");
    for (var i = rows.length - 1; i >= 0; i--) {
        rows[i].parentNode.removeChild(rows[i]);
    }
}

function JSON_to_URLEncoded(element, key, list) {
    var list = list || [];
    if (typeof (element) == 'object') {
        for (var idx in element)
            JSON_to_URLEncoded(element[idx], key ? key + '[' + idx + ']' : idx, list);
    } else {
        list.push(key + '=' + encodeURIComponent(element));
    }
    return list.join('&');
}

function SeeQ() {
    switch (document.title) {
        case "Music App":
            document.location.pathname = "/MusicQ/q.html";
            break;
        default:
            document.location.pathname = "/MusicQ/";
            break;
    }
}