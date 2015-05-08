var uuid = Meteor.npmRequire('uuid');

Meteor.methods({
    doYoutube: function () {
        if (! Meteor.userId()) { throw new Meteor.Error("not-authorized"); }
        var Youtube = Meteor.npmRequire("youtube-api");
        Youtube.authenticate({
            type: "oauth",
            token: Meteor.user().services.google.accessToken
        });
        Youtube.videos.insert();
        Youtube.channels.list({
            "part": "id",
            "mySubscribers": true,
            "maxResults": 50
        }, console.log);
    },
    showUploads: function () {
        console.log(UploadProgress.find({}));
    },
    upload: function () {
        if (! Meteor.userId()) { throw new Meteor.Error("not-authorized"); }
        UploadProgress.remove({});
        var metadata = {
            snippet: { title: 'New Upload', description: 'Uploaded with ResumableUpload' },
            status: { privacyStatus: 'private' }
        };

        var ru = new resumableUpload();
        ru.uploadId = uuid.v1();
        ru.tokens = { access_token: Meteor.user().services.google.accessToken };
        ru.filepath = '/home/taylor/git/smash4up/deardango.mp4';
        ru.metadata = metadata;
        ru.monitor = true;
        ru.retry = 3;

        UploadProgress.insert({
            uploadId: uploadId,
            title: metadata.snippet.title,
            createdAt: new Date(),
            progress: 0
        });

        ru.initUpload();

        ru.on('progress', Meteor.bindEnvironment(function (prog) {
            console.log("GOT PROGRESS");
            console.log(prog);
            UploadProgress.update({ uploadId: prog.uploadId }, { $set: { progress: prog.progress }});
        }, function(error) { console.log(error); }));

        ru.on('success', Meteor.bindEnvironment(function (success) {
            console.log("GOT SUCCESS");
            console.log(success);
            UploadProgress.update({ uploadId: success.uploadId }, { $set: { progress: 100 }});
        }, function (error) { console.log(error); }));

        ru.on('error', function(err) {
            console.log("GOT ERROR");
            console.log(err);
        });
    },
    thumbnailUpload: function (video_id, image_data) {
        if (! Meteor.userId()) { throw new Meteor.Error("not-authorized"); }

        var ru = new resumableUpload();
        ru.is_thumbnail = true;
        ru.videoId = video_id;
        ru.uploadId = uuid.v1();
        ru.tokens = { access_token: Meteor.user().services.google.accessToken };
        ru.image_data = image_data;
        ru.metadata = {};
        ru.monitor = true;

        ru.initUpload();

        ru.on('progress', Meteor.bindEnvironment(function (prog) {
            console.log("GOT PROGRESS");
            console.log(prog);
        }, function(error) { console.log(error); }));

        ru.on('success', Meteor.bindEnvironment(function (success) {
            console.log("GOT SUCCESS");
            console.log(success);
        }, function (error) { console.log(error); }));

        ru.on('error', function(err) {
            console.log("GOT ERROR");
            console.log(err);
        });
    },
    fakeUpload: function () {
        UploadProgress.remove({});
        UploadProgress.insert({
            title: "COAB - SuperOven (Luigi) vs. bobeta (Luigi)",
            createdAt: new Date(),
            progress: 60
        });
        UploadProgress.insert({
            title: "COAB - Crow (Peach) vs. JeepySol (Wario)",
            createdAt: new Date(),
            progress: 0
        });
        UploadProgress.insert({
            title: "COAB - Sean (Diddy) vs. Arikie (Sonic)",
            createdAt: new Date(),
            progress: 100
        });
    }
});

Meteor.startup(function () {});