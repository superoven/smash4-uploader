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

function render(player1_id, player1_name, player2_id, player2_name) {
    images = {
        'bg': '/img/bg.png',
        'player1': make_char_url(player1_id),
        'player2': make_char_url(player2_id)
    };
    function character_render(ctx, character, player_slot_num) {
        var is_player1 = (player_slot_num == 1);
        var query = is_player1 ? 'flipLeft' : 'flipRight';
        var player_id = (is_player1) ? player1_id : player2_id;
        var portrait_y_axis = 100;

        var should_flip = PortraitOrientations[player_id][query];
        if (should_flip && !is_player1) {
            ctx.translate(800, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(character, 0, portrait_y_axis);
            ctx.translate(800, 0);
            ctx.scale(-1, 1);
        }
        else if (should_flip && is_player1) {
            ctx.scale(-1, 1);
            ctx.translate(-400, 0);
            ctx.drawImage(character, 0, portrait_y_axis);
            ctx.scale(-1, 1);
            ctx.translate(-400, 0);
        }
        else if (!should_flip && is_player1) {
            ctx.drawImage(character, 0, portrait_y_axis);
        }
        else if (!should_flip && !is_player1) {
            ctx.translate(400, 0);
            ctx.drawImage(character, 0, portrait_y_axis);
            ctx.translate(-400, 0);
        }
    }
    loadImages(images, function (res) {
        var c = $("#thumbnail")[0];
        var ctx = c.getContext("2d");
        ctx.font = "30px Arial";
        ctx.drawImage(res.bg, 0, 0);
        character_render(ctx, res.player1, 1);
        ctx.fillText(player1_name, 100, 50);
        character_render(ctx, res.player2, 2);
        ctx.fillText(player2_name, 550, 50);
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
        var c = $("#thumbnail")[0];
        Meteor.call("thumbnailUpload", 'E9QGgOqMBGo', c.toDataURL());
    }
});
