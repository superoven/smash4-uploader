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
        ctx.textAlign="end";
        ctx.fillText(tournament_date, 800, bottom_text_y_axis, width_of_text_box);
        ctx.strokeText(tournament_date, 800, bottom_text_y_axis, width_of_text_box);

        ctx.font = "normal bolder 64px sans-serif";
        ctx.textAlign="center";
        ctx.fillText(tournament_name, 400, tournament_text_box_y_axis, width_of_tournament_text_box);
        ctx.strokeText(tournament_name, 400, tournament_text_box_y_axis, width_of_tournament_text_box);
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
    "change .player1-character": reRender,
    "change .player2-character": reRender,
    "change .player1-name": reRender,
    "change .player2-name": reRender,
    "change .match-type": reRender,
    "change .tournament-name": reRender,
    "click .bruh": function (event) {
        var c = $("#thumbnail")[0];
        //console.log($(".video-file"));
        Meteor.call("thumbnailUpload", 'E9QGgOqMBGo', c.toDataURL());
        //Meteor.call("upload");
        //Meteor.call("showVideos");
    },
    'change .video-file': function(event, template) {
        FS.Utility.eachFile(event, function (file) {
            var reader = new FileReader(); //create a reader according to HTML5 File API
            var c = $("#thumbnail")[0];

            reader.onload = function (event) {
                var buffer = new Uint8Array(reader.result); // convert to binary
                Meteor.call('upload', buffer, file.type, file.size, c.toDataURL());
            };

            reader.readAsArrayBuffer(file); //read the file as arraybuffer

            //var xhr = new XMLHttpRequest();
            //xhr.open('POST', '/videoUpload', true);
            //xhr.onload = function(event){
            //    console.log(event);
            //};
            //
            //xhr.send(file);
            //Videos.insert(file, function (err, fileObj) {
            //    if (err) {
            //        console.log(err);
            //    }
            //});
        });
    }
});
