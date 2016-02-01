Template.Home.helpers({
    characters: function () {
        return SmashCharacters;
    },
    match_types: function () {
        return MatchTypes;
    },
    loggedIn: function () {
        return Meteor.user();
    }
});

Template.Home.events({
    "change .player1-character": render,
    "change .player2-character": render,
    "change .player1-name": render,
    "change .player2-name": render,
    "change .match-type": render,
    "change .tournament-name": render,
    "change .file-upload-background": function (event) {
        if (!Meteor.user()) { return; }
        $('.btn-file-display-background').val(event.target.files[0].name);
    },
    "change .file-upload-overlay": function (event) {
        if (!Meteor.user()) { return; }
        $('.btn-file-display-overlay').val(event.target.files[0].name);
    },
    "click .upload-imageset": function (event) {
        if (!Meteor.user()) { return; }
        async.parallel(
            _.reduce(['background', 'overlay'], function(acc, name) {
                acc[name] = function (callback) {
                    var file = $(".file-upload-" + name).prop('files')[0];
                    validateImage(file, name, function (err) {
                        if (err) { showError(err); return; }
                        var fr = new FileReader();
                        fr.onload = function (event) { callback(null, fr.result); };
                        fr.readAsDataURL(file);
                    });
                };
                return acc;
            }, {}),
            function (err, results) {
                if (!err) {
                    var imageset_name = $('.file-upload-name');
                    Meteor.call("uploadImages", imageset_name.val(), results['background'], results['overlay'],
                        function (err, res) {
                            if (err) { showError("Failed to uploadImages -- " + err.error); }
                            else {
                                showSuccess("Successfully uploaded template! It will now be available in the template dropdown.");
                                imageset_name.val('');
                                $('.file-upload-background').val('');
                                $('.btn-file-display-background').val('');
                                $('.file-upload-overlay').val('');
                                $('.btn-file-display-overlay').val('');
                            }
                        }
                    );
                }
            }
        );
    }
});

var _URL = window.URL || window.webkitURL;

function validateImage (file, type, callback) {
    var img = new Image();
    img.src = _URL.createObjectURL(file);
    img.onload = function () {
        var width = img.naturalWidth,
            height = img.naturalHeight;
        _URL.revokeObjectURL(img.src);
        if (width == 640 && height == 360) {
            callback(null);
        }
        else {
            callback("The " + type + " image must be 640x360. It is " + width + "x" + height + ".");
        }
    }
}

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