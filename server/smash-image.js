var uuid = Meteor.npmRequire('uuid');

Meteor.methods({
    upload: function (video_link, content_type, size, title, image_data) {
        if (! Meteor.userId()) { throw new Meteor.Error("not-authorized"); }
        UploadProgress.remove({});
        var uploadId = uuid.v1();
        var metadata = {
            snippet: { title: title, description: "" },
            status: { privacyStatus: 'public' }
        };

        var ru = new resumableUpload();
        ru.uploadId = uploadId;
        ru.content_type = content_type;
        ru.filesize = size;
        ru.tokens = { access_token: Meteor.user().services.google.accessToken };
        ru.video_data = video_link;
        ru.metadata = metadata;
        ru.monitor = true;
        ru.retry = 3;


        UploadProgress.remove({});
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
            var video_id = JSON.parse(success.body)['id'];
            var link = "https://www.youtube.com/watch?v=" + video_id;
            Meteor.call("thumbnailUpload", video_id, image_data);
            UploadProgress.update({ uploadId: success.uploadId }, { $set: {
                progress: 100,
                message: link,
                success: true
            }});
        }, function (error) { console.log(error); }));

        ru.on('error', Meteor.bindEnvironment(function (err) {
            console.log("GOT ERROR");
            if (err.error.message == "Invalid Credentials") {
                UploadProgress.update({ uploadId: err.uploadId }, { $set: { message: "Error: Please log out and log back in" }});
            }
            console.log(err);
        }, function (error) { console.log(error); }));

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
    }
});

Meteor.startup(function () {
    UploadServer.init({
        tmpDir: process.env.PWD + '/.uploads/tmp',
        uploadDir: process.env.PWD + '/.uploads/',
        checkCreateDirectories: true
    });
});
