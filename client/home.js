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

Template.Home.events({
    "change .player1-character": render,
    "change .player2-character": render,
    "change .player1-name": render,
    "change .player2-name": render,
    "change .match-type": render,
    "change .tournament-name": render,
    "click .upload-imageset": function (event) {
        if (!Meteor.user()) { return; }
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
                    var imageset_name = $('.file-upload-name');
                    Meteor.call("uploadImages", imageset_name.val(), results['background'], results['overlay']);
                    imageset_name.val('');
                    $('.file-upload-background').val('');
                    $('.file-upload-overlay').val('');
                } else {
                    console.error("Failed to uploadImages - " + err);
                }
            }
        );
    }
});

if (Meteor.isClient) {
    Template.Home.rendered = function () {
        if (!this._rendered) {
            this._rendered = true;
            this.$('.datetimepicker').datetimepicker({
                format: 'MM/DD/YYYY'
            });
            this.$(".datetimepicker").on("dp.change", function (e) {
                render();
            });
            render();
        }
    };
}