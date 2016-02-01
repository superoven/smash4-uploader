Template.ImageSet.rendered = function () {
    if (!this._rendered) {
        this._rendered = true;
        var c = this.find("[imageset-thumbnail]");
        if (!c) { return; }
        var ctx = c.getContext("2d");
        var self = this;
        async.parallel(
            _.reduce(['background', 'overlay'], function(acc, name) {
                acc[name] = function (callback) {
                    var image = new Image();
                    image.onload = function () {
                        callback(null, image);
                    };
                    image.src = self.data[name];
                };
                return acc;
            }, {}),
            function (err, results) {
                if (!err) {
                    var background = results['background'];
                    var overlay = results['overlay'];
                    ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, c.width, c.height);
                    ctx.drawImage(overlay, 0, 0, overlay.width, overlay.height, 0, 0, c.width, c.height);
                }
            }
        );
    }
};

Template.ImageSet.events({
    "click .remove-button": function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (Session.get("selectedImageSet") == this._id) {
            Session.set("selectedImageSet", null);
            render();
        }
        Meteor.call("removeImageSet", this._id);
    },
    "click .imageset-choice": function (event) {
        event.preventDefault();
        Session.set("selectedImageSet", this._id);
        render();
    }
});

Template.ImageSet.helpers({
    checked: function (event) {
        return Session.get("selectedImageSet") == this._id;
    }
});

Template.ImageSetContainer.helpers({
    image_sets: function () {
        return ImageSet.find({userId: Meteor.userId()});
    },
    image_sets_exists: function () {
        return ImageSet.find({userId: Meteor.userId()}).count();
    }
});