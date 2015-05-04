function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    for(var src in sources) {
        numImages++;
    }
    for(var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if(++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

function make_char_url(char_id) {
    return (char_id.length > 0) ? '/img/portraits/' + char_id + '_01.png' : '/img/portraits/omakase_01.png';
}

function render(player1_img, player1_name, player2_img, player2_name) {
    images = {
        'bg': '/img/bg.png',
        'player1': make_char_url(player1_img),
        'player2': make_char_url(player2_img)
    };
    loadImages(images, function (res) {
        var c = $("#thumbnail")[0];
        var ctx = c.getContext("2d");
        ctx.font = "30px Arial";
        ctx.drawImage(res.bg, 0, 0);
        ctx.drawImage(res.player1, 0, 30);
        ctx.fillText(player1_name, 100, 50);
        ctx.translate(800, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(res.player2, 0, 30);
        ctx.translate(800, 0);
        ctx.scale(-1, 1);
        ctx.fillText(player2_name, 550, 50);
        console.log(c.toDataURL());
    });
}

if (Meteor.isClient) {
    Template.Home.helpers({
        characters: function () {
            return SmashCharacters;
        }
    });

    Template.Home.rendered = function () {
        if (!this._rendered) {
            this._rendered = true;
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
        }
    };
}

Template.Home.events({
    "change .player1-character": function (event) {
        render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
        return false;
    },
    "change .player2-character": function (event) {
        render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
        return false;
    },
    "change .player1-name": function (event) {
        render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
        return false;
    },
    "change .player2-name": function (event) {
        render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
        return false;
    },
    "click .bruh": function (event) {
        Meteor.call("upload");
    }
});
