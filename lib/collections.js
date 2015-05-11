var videoStore = new FS.Store.GridFS("videos");
Videos = new FS.Collection("videos", { stores: [videoStore] });

UploadProgress = new Mongo.Collection("uploadprogress");

