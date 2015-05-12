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
    upload: function (video_buffer, content_type, size, image_data) {
        if (! Meteor.userId()) { throw new Meteor.Error("not-authorized"); }
        UploadProgress.remove({});
        var uploadId = uuid.v1();
        var metadata = {
            snippet: { title: 'New Upload - Shrek?', description: 'Uploaded with ResumableUpload' },
            status: { privacyStatus: 'private' }
        };

        var ru = new resumableUpload();
        ru.uploadId = uploadId;
        ru.content_type = content_type;
        ru.filesize = size;
        ru.tokens = { access_token: Meteor.user().services.google.accessToken };
        ru.video_data = video_buffer;
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
            console.log(JSON.parse(success.body)['id']);
            Meteor.call("thumbnailUpload", JSON.parse(success.body)['id'], image_data);
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
    },
    showVideos: function () {
       console.log(Videos.findOne({}).original.type);
    }
});

var db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
var GridStore = Meteor.npmRequire('mongodb').GridStore;

//Router.route('/videoUpload', function(req, res) {
WebApp.connectHandlers.use('/videoUpload', Meteor.bindEnvironment(function (req, res) {
    console.log("FUCK");
    Meteor.call("thumbnailUpload", Meteor.bindEnvironment(function (err, ret) {
        console.log(err);
        console.log(ret);
    }, function (err) {}));
    //var file = new GridStore(db,'filename','w').stream(true); //start the stream
    //
    //file.on('error',function(e){ console.log("ERROR: " + e)});
    //file.on('end',function () { res.end(); });
    //var file = new FS.File(req);
    //console.log(req.headers);
    //req.on('data', function (data) {
    //    console.log(data.length);
    //});
    //req.on('end', function (err, data) {
    //    console.log("end");
    //});
    //console.log(req.length);

    //req.pipe(process.stdout);
}), function (err) {});

Meteor.startup(function () {});