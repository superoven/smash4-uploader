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

function render(player1_id, player1_name, player2_id, player2_name, match_type, tournament_name, tournament_date) {
    images = {
        'bg': '/img/bg_default.png',
        'player1': make_char_url(player1_id),
        'player2': make_char_url(player2_id),
        'overlay': '/img/overlay_default.png'
    };
    function character_render(ctx, character, player_slot_num) {
        var is_player1 = (player_slot_num == 1);
        var query = is_player1 ? 'flipLeft' : 'flipRight';
        var player_id = (is_player1) ? player1_id : player2_id;
        var portrait_y_axis = 0;
        var resize_size = 308;

        var should_flip = PortraitOrientations[player_id][query];
        if (should_flip && !is_player1) {
            ctx.translate(640, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(character, 0, portrait_y_axis, resize_size, resize_size);
            ctx.translate(640, 0);
            ctx.scale(-1, 1);
        }
        else if (should_flip && is_player1) {
            ctx.scale(-1, 1);
            ctx.translate(-320, 0);
            ctx.drawImage(character, 0, portrait_y_axis, resize_size, resize_size);
            ctx.scale(-1, 1);
            ctx.translate(-320, 0);
        }
        else if (!should_flip && is_player1) {
            ctx.drawImage(character, 0, portrait_y_axis, resize_size, resize_size);
        }
        else if (!should_flip && !is_player1) {
            ctx.translate(360, 0);
            ctx.drawImage(character, 0, portrait_y_axis, resize_size, resize_size);
            ctx.translate(-360, 0);
        }
    }
    loadImages(images, function (res) {
        var top_text_y_axis = 60;
        var tournament_text_box_y_axis = 300;
        var bottom_text_y_axis = 350;
        var width_of_text_box = 280;
        var width_of_tournament_text_box = 400;

        var c = $("#thumbnail")[0];
        var ctx = c.getContext("2d");

        ctx.drawImage(res.bg, 0, 0);

        character_render(ctx, res.player1, 1);
        character_render(ctx, res.player2, 2);

        ctx.drawImage(res.overlay, 0, 0);

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.textAlign="start";
        ctx.font = "normal bolder 74px sans-serif";
        ctx.fillText(player1_name, 0, top_text_y_axis, width_of_text_box);
        ctx.strokeText(player1_name, 0, top_text_y_axis, width_of_text_box);
        ctx.textAlign="end";
        ctx.fillText(player2_name, 640, top_text_y_axis, width_of_text_box);
        ctx.strokeText(player2_name, 640, top_text_y_axis, width_of_text_box);

        ctx.textAlign="start";
        ctx.font = "normal bolder 40px sans-serif";
        ctx.fillText(match_type, 0, bottom_text_y_axis, width_of_text_box);
        ctx.strokeText(match_type, 0, bottom_text_y_axis, width_of_text_box);
        ctx.textAlign="end";
        ctx.fillText(tournament_date, 640, bottom_text_y_axis, width_of_text_box);
        ctx.strokeText(tournament_date, 640, bottom_text_y_axis, width_of_text_box);
        ctx.textAlign="center";
        ctx.font = "normal bolder 80px sans-serif";
        ctx.fillText(tournament_name, 320, tournament_text_box_y_axis, width_of_tournament_text_box);
        ctx.strokeText(tournament_name, 320, tournament_text_box_y_axis, width_of_tournament_text_box);
    });
}

function doRender() {
    render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val(), $(".match-type").val(), $(".tournament-name").val(), $('.tournament-date').val());
}

function reRender(event) {
    doRender();
    return false;
}

if (Meteor.isClient) {
    Template.Home.helpers({
        characters: function () {
            return SmashCharacters;
        },
        match_types: function () {
            return MatchTypes;
        },
        image_sets: function () {
            return ImageSet.find({});
        }
    });

    Template.Home.rendered = function () {
        if (!this._rendered) {
            this._rendered = true;
            this.$('.datetimepicker').datetimepicker({
                format: 'MM/DD/YYYY'
            });
            this.$(".datetimepicker").on("dp.change", function (e) {
                doRender();
            });
            doRender();
        }
    };
}

Template.Home.events({
    "change .player1-character": reRender,
    "change .player2-character": reRender,
    "change .player1-name": reRender,
    "change .player2-name": reRender,
    "change .match-type": reRender,
    "change .tournament-name": reRender,
    "click .bruh": function (event) {
        async.parallel(
            _.reduce(['background', 'overlay'], function(acc, name) {
                acc[name] = function (callback) {
                    var fr = new FileReader();
                    fr.onload = function (event) { callback(null, fr.result); };
                    fr.readAsDataURL($(".file-upload-" + name).prop('files')[0]);
                };
                return acc;
            }, {}),
            function (err, results) {
                if (!err) {
                    Meteor.call("uploadImages", results['background'], results['overlay']);
                } else {
                    console.error("Failed to uploadImages - " + err);
                }
            }
        );
    }
});
