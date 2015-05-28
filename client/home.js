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
    console.log(player1_id);
    images = {
        'bg': '/img/bg.png',
        'player1': make_char_url(player1_id),
        'player2': make_char_url(player2_id),
        'overlay': '/img/overlay.png'
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
        var top_text_y_axis = 140;
        var tournament_text_box_y_axis = 466;
        var bottom_text_y_axis = 515;
        var width_of_text_box = 360;
        var width_of_tournament_text_box = 400;

        var c = $("#thumbnail")[0];
        var ctx = c.getContext("2d");

        ctx.drawImage(res.bg, 0, 0);

        character_render(ctx, res.player1, 1);
        character_render(ctx, res.player2, 2);

        ctx.drawImage(res.overlay, 0, 0);

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";

        ctx.font = "normal bolder 74px sans-serif";
        ctx.textAlign="center";
        ctx.fillText(player1_name, 200, top_text_y_axis, width_of_text_box);
        ctx.strokeText(player1_name, 200, top_text_y_axis, width_of_text_box);
        ctx.textAlign="center";
        ctx.fillText(player2_name, 600, top_text_y_axis, width_of_text_box);
        ctx.strokeText(player2_name, 600, top_text_y_axis, width_of_text_box);

        ctx.font = "normal bolder 40px sans-serif";
        ctx.textAlign="start";
        ctx.fillText(match_type, 0, bottom_text_y_axis, width_of_text_box);
        ctx.strokeText(match_type, 0, bottom_text_y_axis, width_of_text_box);
        //ctx.textAlign="end";
        //ctx.fillText(tournament_date, 800, bottom_text_y_axis, width_of_text_box);
        //ctx.strokeText(tournament_date, 800, bottom_text_y_axis, width_of_text_box);

        ctx.font = "normal bolder 64px sans-serif";
        ctx.textAlign="center";
        ctx.fillText(tournament_name, 400, tournament_text_box_y_axis, width_of_tournament_text_box);
        ctx.strokeText(tournament_name, 400, tournament_text_box_y_axis, width_of_tournament_text_box);
    });
}

function doRender() {
    var title = $(".video-title").val().trim();
    var split_title = title.split("-");
    var tournament_name = split_title[0].trim();
    var everything_else = split_title.slice(1, 12).join("");
    var match_type = everything_else.split(":")[0].trim();
    var chars_string = everything_else.split(":")[1].trim();
    console.log(chars_string);
    var arr = chars_string.match(/^(.+)\((.+)\) vs\.? (.+)\((.+)\)$/);
    var player1_name = arr[1].trim();
    var player1_char = arr[2].trim().split("/")[0].trim().replace(/\W/g, '').toLowerCase();
    var player2_name = arr[3].trim();
    var player2_char = arr[4].trim().split("/")[0].trim().replace(/\W/g, '').toLowerCase();
    console.log(player1_char);
    console.log(player1_name);
    console.log(player2_char);
    console.log(player2_name);
    render(ReverseCharacterDict[player1_char], player1_name, ReverseCharacterDict[player2_char], player2_name, match_type, tournament_name, '');
}

String.prototype.format = function() {
    var content = this;
    for (var i=0; i < arguments.length; i++) {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);
    }
    return content;
};

function reRender(event) {
    doRender();
    var title = "{0} - {1}: {2} ({3}) vs. {4} ({5})".format(
        $(".tournament-name").val(),
        $(".match-type").val(),
        $(".player1-name").val(),
        CharacterDict[$(".player1-character").val()],
        $(".player2-name").val(),
        CharacterDict[$(".player2-character").val()]);
    //$(".video-title").val(title);
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
        uploads: function () {
            return UploadProgress.find({});
        }
    });

    Template.Home.rendered = function () {
        if (!this._rendered) {
            this._rendered = true;
            this.$('.datetimepicker').datetimepicker({
                format: 'MM/DD/YYYY'
            });
            this.$(".datetimepicker").on("dp.change", function (e) { doRender(); });
            doRender();
        }
    };
}


Template.Home.events({
    //"change .player1-character": reRender,
    //"change .player2-character": reRender,
    //"change .player1-name": reRender,
    //"change .player2-name": reRender,
    //"change .match-type": reRender,
    //"change .tournament-name": reRender,
    "change .video-title": reRender
});

Meteor.startup(function() {
    Uploader.uploadUrl = Meteor.absoluteUrl("upload");
    Uploader.finished = function (index, fileInfo, templateContext) {
        console.log("IT BEGINS");
        Meteor.call("upload", fileInfo.url, fileInfo.type, fileInfo.size, $(".video-title").val(), $("#thumbnail")[0].toDataURL());
    }
});