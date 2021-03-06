var getUrl = window.location;
var ApiUrl = getUrl.protocol + "//" + getUrl.host + "/";

window.onload = function Start() {
    let id = getParameterByName("id")
    console.log("id: " + id);

    if (id === undefined || id === 0 || id === null) {
        document.location.pathname = "/MusicQ/Room/";
    }


    if (document.title == "MusicQ Search") {
        let btn = document.getElementById("searchTag")
        btn.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) /*Press Enter*/{
              event.preventDefault();
              document.getElementById("searchBtn").click();
            }
          }); 
    }
}


function SendData() {
    let q = document.getElementById("searchTag");
    var obj = { "title": q.value };
    Post(obj, ApiUrl + "search").then(function (d) {
        AddItems(d);
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
        var cell1 = document.createElement("div").appendChild(document.createElement("b"))
        var cell2 = document.createElement("img")
        var cell3 = document.createElement("div")

        var anchor = document.createElement("a")
        row.appendChild(anchor);

        cell1.textContent = vids.items[i].title;
        cell2.src = vids.items[i].thumbnails.default.url
        cell3.textContent = vids.items[i].channelTitle;

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
    Post(obj, ApiUrl + "add" + `?id=${getParameterByName("id")}`).then(function (d) {

        if (("succes" in d))
            document.location.pathname = "/MusicQ/Room/"
        else
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

function SeeQ(a = null) {
    if (a !== null) {
        document.location.pathname = `/MusicQ/${a}`;
        return;
    }

    switch (document.title) {
        case "MusicQ Search":
            document.location.pathname = "/MusicQ/Q";
            break;
        default:
            document.location.pathname = "/MusicQ/";
            break;
    }
}

function CopyText(textOrigin, btn, clickedText = "Copied") {
    let ogText = btn.textContent;
    if (btn.textContent == clickedText) return;

    textOrigin.select();
    textOrigin.setSelectionRange(0, 99999);

    document.execCommand("copy");
    btn.textContent = clickedText;

    setTimeout(function () {
        btn.textContent = ogText;
    }, 1500);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function GetPlayListIDFromUrl(url = document.location.href) {
    let id = parseQueryString(url)["list"]
    if (id !== undefined) {
        return id;
    } else return null;
}

var parseQueryString = function () {
    var str = window.location.search;
    var objURL = {};

    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function ($0, $1, $2, $3) {
            objURL[$1] = $3;
        }
    );
    return objURL;
};

function updateQueryParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

function Redirect(url) {
    window.location.href = url;;//_nodes[index].url
}

function AddMetaTags() {
    let id = getParameterByName("id");

    if (id !== undefined || id !== 0 || id !== null) {
        GetURL(ApiUrl + "current?id=" + id).then(function (data) {
            data = JSON.parse(data);
           // console.log(data)

            if (("success" in data)) {
                //general meta tag
                return;
            } else {

                let head = document.getElementsByTagName('head')[0];

                /*
                let meta = document.createElement('meta');
                meta.setAttribute('property', "theme-color");
                meta.content = "#93E6FA";
                meta.name = "theme-color";
                head.appendChild(meta);

                meta = document.createElement('meta');
                meta.setAttribute('property', "og:title");
                meta.content = "MusicQ";
                head.appendChild(meta);

                meta = document.createElement('meta');
                meta.setAttribute('property', "og:site_name");
                meta.content = "MusicQ";
                head.appendChild(meta);

                let description = data.current.title;

                meta = document.createElement('meta');
                meta.setAttribute('property', "og:description");
                meta.content = description;
                head.appendChild(meta);

                meta = document.createElement('meta');
                meta.setAttribute('property', "og:image");
                meta.content = data.current.thumbnails.default.url;
                head.appendChild(meta);

                meta = document.createElement('meta');
                meta.setAttribute('property', "og:type");
                meta.content = "website";
                meta.name = "og:type";
                head.appendChild(meta);

                meta = document.createElement('meta');
                meta.setAttribute('property', "og:url");
                meta.content = document.URL;
                meta.name = "og:url";
                head.appendChild(meta);*/
            }
        })
    }
}