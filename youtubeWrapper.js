const request = require('request');

module.exports.Search = function (
    params = {
        q: "",
        maxResults: 10,
        key: "",
        type: "channel,playlist,video",
        videoEmbeddable: "any",
        videoSyndicated: "any"
    }) {
    return new Promise(function (resolve, reject) {
        var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${params.maxResults}&q=${params.q}&key=${params.key}&type=${params.type}&videoEmbeddable=${params.videoEmbeddable}&videoSyndicated=${params.videoSyndicated}`
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (error)
                reject(error);

            var result = body;
            var pageInfo = {
                totalResults: result.pageInfo.totalResults,
                resultsPerPage: result.pageInfo.resultsPerPage,
                nextPageToken: result.nextPageToken,
                prevPageToken: result.prevPageToken
            }
            var findings = result.items.map(function (item) {
                var link = ''
                var id = ''
                switch (item.id.kind) {
                    case 'youtube#channel':
                        link = 'https://www.youtube.com/channel/' + item.id.channelId
                        id = item.id.channelId
                        break
                    case 'youtube#playlist':
                        link = 'https://www.youtube.com/playlist?list=' + item.id.playlistId
                        id = item.id.playlistId
                        break
                    default:
                        link = 'https://www.youtube.com/watch?v=' + item.id.videoId
                        id = item.id.videoId
                        break
                }

                return {
                    id: id,
                    link: link,
                    kind: item.id.kind,
                    publishedAt: item.snippet.publishedAt,
                    channelId: item.snippet.channelId,
                    channelTitle: item.snippet.channelTitle,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnails: item.snippet.thumbnails
                }
            })
            resolve({ pageInfo: pageInfo, items: findings });
        });
    });
}

module.exports.GetPlaylistInfo = function (params = {
    playlistId: "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj",
    key: "",
    maxResults: 5
}) {
    var url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${params.playlistId}&maxResults=${params.maxResults}&key=${params.key}`
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            resolve(body)
        });
    });
}


module.exports.GetPlaylist = function (
    params = {
        playlistId: "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj",
        key: "",
        maxResults: 10
    }
) {
    var url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${params.playlistId}&maxResults=${params.maxResults}&key=${params.key}`

    return new Promise(function (resolve, reject) {
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            GetPlayListVids(body, url).then(function (playlist) {
                console.log(body)
                resolve(playlist)
            })
        });
    });
}

function GetPlayListVids(body, url) {
    return new Promise(function (resolve, reject) {
        var itemList = []
        var itemsRaw = body.items;
        let nextToken = body.nextPageToken;
        if (body.pageInfo === undefined) resolve(body); //invalid playlist

        if (body.pageInfo.totalResults > body.pageInfo.resultsPerPage) {
            GetAllVids();
        } else Return();


        function Return() {
            //map to proper object!!!
            itemsRaw.forEach(e => {
                let a = {}
                a = e.snippet;

                a.id = e.snippet.resourceId.videoId;
                delete a.resourceId;

                itemList.push(a);
            });
            resolve({ pageInfo: body.pageInfo, items: itemList });
        }

        function GetAllVids() {
            request({
                url: url + `&pageToken=${nextToken}`,
                json: true
            }, function (error, response, body) {
                Array.prototype.push.apply(itemsRaw, body.items)
                if (body.nextPageToken) {
                    nextToken = body.nextPageToken;
                    GetAllVids();
                } else {
                    Return();
                }
            });
        }
    });
}