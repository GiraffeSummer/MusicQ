var middleware = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // if (req.method == "HEAD") {
    let pl;
    if (!("id" in req.query && players[req.query.id])) {
        pl = players[req.query.id];
    }
    /*
    res.set({
        'theme-color': '#00FF00',
        'og:type': 'website',
        "og:title": "MusicQDDDD"
    })*/
    //res.set('theme-color', '#cc0000')
    /*res.set()
    res.set(")*/

    console.log("HEAD-")

    if (pl) {
        /* res.set("og:description", `Music App for everyone to Queue music remotely using their own phone\nJoin me in room: ${pl.name}`)
         res.set('og:url', `http://musicq.cripplerick.com/MusicQ/?id=${pl.id}`)
         res.set("og:image", (pl.image) ? pl.image : pl.current.thumbnails.default.url)*/
    } else {
        /*res.set("og:description", `Music App for everyone to Queue music remotely using their own phone`)
        res.set('og:url', 'http://musicq.cripplerick.com/')
        res.set("og:image", '')*/
    }
    // return;
    // }
    res.end();
    next()
}
app.use(middleware);