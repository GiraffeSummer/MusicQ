const VidIds = ["GLVpduv0AzM", "K_9tX4eHztY", "m97RhpSkJ_I","OSUxrSe5GbI","DkeiKbqa02g","q_gKdueG26s","9ClYy0MxsU0","DodwqC82iRU"];

module.exports.RandomSong = function () {


    return VidIds[Random(VidIds.length)];

    function Random(max) { return (Math.floor(Math.random() * max)); }
}