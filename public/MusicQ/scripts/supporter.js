document.addEventListener('DOMContentLoaded', function () {
    CheckSupporter();
}, false);

function CheckSupporter() {
    Post({}, "/checksupporter").then((d) => {
        if (d.session.supporter) {
            console.log("Thank you for Supporting!")
            if (document.getElementById("roomPlaylist")) { CustomThumbnail(); Unlisted(); }
        }
    })
}

function IsSupporter() {
    return new Promise(function (resolve, error) {
        Post({}, "/checksupporter").then((d) => {
            let user = {
                supporter: d.session.supporter,
                key: d.session.passkey
            }
            if (d.payment) {
                user.name = d.payment.payer.name;
                useremail = d.payment.payer.email
            }
            resolve(user)
        })
    })
}

function Login(key, redirect = function (ret) {}) {
    let o = { passkey: key }
    console.log("logging in: " + key)
    Post(o, "/supporter").then((d) => {
        if (!d.session.supporter)
            console.log("You are not a supporter")
        else
            console.log("You are a supporter")

        redirect(d.session.supporter);
    })
}

function CustomThumbnail() {
    let submitBtn = document.getElementById("createRoomBtn")
    let field = document.querySelector("fieldset")
    let input = document.createElement("input")
    let textBox = document.createElement("p");
    input.type = "file";
    input.id = "thumbnail";
    input.name = input.id;

    textBox.textContent = "💸 Choose a custom Thumbnail"
    textBox.style.margin = "5px"

    input.addEventListener("change", function (event) {
        CheckImageFile();
    }, false);

    input.accept = "image/png, image/jpeg,image/gif";
    field.insertBefore(textBox, submitBtn)
    field.insertBefore(input, submitBtn)
    field.insertBefore(document.createElement("br"), submitBtn)
    /field.insertBefore(document.createElement("br"), submitBtn)
}


function Unlisted() {
    let field = document.querySelector("fieldset")
    let plBox = document.getElementById("roomPass")
    let checkbox = document.createElement("input")
    let text = document.createElement("p")
    checkbox.type = "checkbox";
    checkbox.id = "roomListed";
    checkbox.checked = true;
    checkbox.style.marginLeft = "20px"
    checkbox.style.marginBottom = "20px"
    text.textContent = "💸 Room listed (Show this room in room list?)";
    text.style.margin = "5px"
    text.style.marginLeft = "2px"
    text.style.marginTop = "15px"

    field.insertBefore(checkbox, plBox.nextSibling)
    field.insertBefore(text, checkbox)
    field.insertBefore(document.createElement("br"), plBox.nextSibling)
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