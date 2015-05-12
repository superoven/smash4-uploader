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

function doRender(data) {
    render(data.p1_char, data.p1_name, data.p2_char, data.p2_name, data.match_type, $(".tournament-name").val(), $('.tournament-date').val());
}

function reRender(event, instance, parameter) {
    console.log(event);
    console.log(instance);
    console.log(parameter);

}

if (Meteor.isClient) {
    Template.Home.helpers({
        tournamentvids: function () {
            return TournamentVideo.find({});
        }
    });

    Template.TournamentVid.helpers({
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
            //Meteor.call("removeVid");
            //TournamentVideo.insert({
            //    p1_name: "P1 Name1",
            //    p2_name: "P2 Name",
            //    p1_char: "koopa",
            //    p2_char: "koopa",
            //    match_type: "wb",
            //    userId: Meteor.userId()
            //});
            //TournamentVideo.insert({
            //    p1_name: "Example2",
            //    p2_name: "me",
            //    p1_char: "diddy",
            //    p2_char: "lizardon",
            //    match_type: "wb",
            //    userId: Meteor.userId()
            //});
            this.$(".datetimepicker").on("dp.change", function (e) { doRender(); });

            //TODO: Render initially for all Videos
            console.log(TournamentVideo.find({}));

            //var raceCursor = TournamentVideo.find({});
            //var race;
            //while ( raceCursor.hasNext() ) {
            //    race = raceCursor.next();
            //    console.log( race.p1_name );
            //}

            //TournamentVideo.find({}).forEach(function (obj) {
            //    console.log(obj);
            //});
            //doRender();
        }
    };
}

Template.TournamentVid.events({
    "change .player1-character": function(event, instance) {
        TournamentVideo.update({_id: instance.data._id}, {$set: {p1_char: event.target.value}});
        doRender(TournamentVideo.findOne({_id: instance.data._id}));
        return false;
    },
    "change .player2-character": function(event, instance) {
        TournamentVideo.update({_id: instance.data._id}, {$set: {p2_char: event.target.value}});
        doRender(TournamentVideo.findOne({_id: instance.data._id}));
        return false;
    },
    "change .player1-name": function(event, instance) {
        TournamentVideo.update({_id: instance.data._id}, {$set: {p1_name: event.target.value}});
        doRender(TournamentVideo.findOne({_id: instance.data._id}));
        return false;
    },
    "change .player2-name": function(event, instance) {
        TournamentVideo.update({_id: instance.data._id}, {$set: {p2_name: event.target.value}});
        doRender(TournamentVideo.findOne({_id: instance.data._id}));
        return false;
    },
    "change .match-type": function(event, instance) {
        TournamentVideo.update({_id: instance.data._id}, {$set: {hi: event.target.value}});
        doRender(TournamentVideo.findOne({_id: instance.data._id}));
        return false;
    },
    //"change .tournament-name": reRender,
    //"click .bruh": function (event, instance) {
    //    console.log(instance);
    //    //var c = $("#thumbnail")[0];
    //    //console.log($(".video-file"));
    //    //Meteor.call("thumbnailUpload", 'E9QGgOqMBGo', c.toDataURL());
    //    //Meteor.call("upload");
    //    //Meteor.call("showVideos");
    //},
    'change .video-file': function(event, template) {
        FS.Utility.eachFile(event, function (file) {
            var reader = new FileReader();
            var c = $("#thumbnail")[0];
            reader.onload = function (event) {
                var buffer = new Uint8Array(reader.result);
                Meteor.call('upload', buffer, file.type, file.size, c.toDataURL());
            };
            reader.readAsArrayBuffer(file);
        });
    }
});
