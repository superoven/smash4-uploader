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

function drawText(ctx, text, x, y, width, height) {
    ctx.fillText(text, x, y, width, height);
    ctx.strokeText(text, x, y, width, height);
}

function make_char_url(char_id) {
    return (char_id.length > 0) ? '/img/portraits/' + char_id + '_01.png' : '/img/portraits/omakase_01.png';
}

render = function (event) {
    var player1_id = $(".player1-character").val(),
        player1_name = $(".player1-name").val(),
        player2_id = $(".player2-character").val(),
        player2_name = $(".player2-name").val(),
        match_type = $(".match-type").val(),
        tournament_name = $(".tournament-name").val(),
        tournament_date = $('.tournament-date').val();
    var imageset_data = {background: '/img/bg_default.png', overlay: '/img/overlay_default.png'};
    if (Session.get("selectedImageSet")) {
        var imageset_data = ImageSet.findOne({_id: Session.get("selectedImageSet")});
        $('.template-select-button').html(imageset_data.name + " <span class='caret'></span>");
    }
    var images = {
        'bg': imageset_data.background,
        'player1': make_char_url(player1_id),
        'player2': make_char_url(player2_id),
        'overlay': imageset_data.overlay
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
        drawText(ctx, player1_name, 0, top_text_y_axis, width_of_text_box);
        ctx.textAlign="end";
        drawText(ctx, player2_name, 640, top_text_y_axis, width_of_text_box);
        ctx.textAlign="start";
        ctx.font = "normal bolder 40px sans-serif";
        drawText(ctx, match_type, 0, bottom_text_y_axis, width_of_text_box);
        ctx.textAlign="end";
        drawText(ctx, tournament_date, 640, bottom_text_y_axis, width_of_text_box);
        ctx.textAlign="center";
        ctx.font = "normal bolder 80px sans-serif";
        drawText(ctx, tournament_name, 320, tournament_text_box_y_axis, width_of_tournament_text_box);
    });
};