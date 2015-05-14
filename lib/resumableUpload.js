var fs = Meteor.npmRequire('fs');
var request = Meteor.npmRequire('request');
var EventEmitter = Meteor.npmRequire('events').EventEmitter;
var mime = Meteor.npmRequire('mime');
var util = Meteor.npmRequire('util');
var resumer = Meteor.npmRequire('resumer');


resumableUpload = function () {
    this.uploadId = '';
	this.byteCount	= 0; //init variables
	this.tokens	= {};
	this.image_data	= '';
    this.video_data	= '';
	this.metadata	= {};
	this.monitor	= false;
	this.retry	= -1;
    this.is_thumbnail = false;
    this.videoId = '';
};

util.inherits(resumableUpload, EventEmitter);


//Init the upload by POSTing google for an upload URL (saved to self.location)
resumableUpload.prototype.initUpload = function() {
	var self = this;
    if (self.is_thumbnail) {
        self.data = new Buffer(self.image_data.split(",")[1], 'base64');
        self.filesize = self.data.length;
        self.content_type = self.image_data.split(":")[1].split(";")[0];
    }
    else { self.data = self.video_data }

	var options = {
		url:	(self.is_thumbnail) ? 'https://www.googleapis.com/upload/youtube/v3/thumbnails/set?uploadType=resumable&videoId=' + self.videoId
            : 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails',
		headers: {
		  'Host':			'www.googleapis.com',
		  'Authorization':		'Bearer ' + this.tokens.access_token,
		  'Content-Length':		new Buffer(JSON.stringify(this.metadata)).length,
		  'Content-Type':		'application/json',
		  'X-Upload-Content-Length': self.filesize,
		  'X-Upload-Content-Type': self.content_type
		},
		body: JSON.stringify(this.metadata)
	};
	//Send request and start upload if success
	request.post(options, function(error, response, body) {
		if (!error) {
			if (!response.headers.location && body) {
				// bad-token, bad-metadata, etc...
				body = JSON.parse(body);
				if (body.error) {
					self.emit('error', {uploadId: self.uploadId, error: body.error});
					return;
				}
			}
			self.location = response.headers.location;
			self.putUpload();
			if (self.monitor) //start monitoring (defaults to false)
				self.startMonitoring();
		} else {
			self.emit('error', {uploadId: self.uploadId, error:body.error});
		}
	});
};

//Pipes uploadPipe to self.location (Google's Location header)
resumableUpload.prototype.putUpload = function() {
	var self = this;
	var options = {
		url: self.location, //self.location becomes the Google-provided URL to PUT to
		headers: {
		  'Authorization':	'Bearer ' + self.tokens.access_token,
		  'Content-Length':	self.filesize - self.byteCount,
		  'Content-Type': self.content_type
		}
	};
	try {
        var stream = resumer().queue(self.data).end();

        if (self.is_thumbnail) {
            stream.pipe(request.put(options, function (error, response, body) {
                if (!error) {
                    self.emit('success', {uploadId: self.uploadId, body: body});
                    return;
                } else {
                    self.emit('error', error);
                    if (self.retry > 0) {
                        self.retry--;
                        self.getProgress();
                        self.initUpload();
                    }
                    // Allow unlimited retries
                    if (self.retry == -1) {
                        self.getProgress();
                        self.initUpload();
                    }
                }
            }));
        } else {
            request(self.data).pipe(request.put(options, function (error, response, body) {
                if (!error) {
                    self.emit('success', {uploadId: self.uploadId, body: body});
                    return;
                } else {
                    self.emit('error', error);
                    if (self.retry > 0) {
                        self.retry--;
                        self.getProgress();
                        self.initUpload();
                    }
                    // Allow unlimited retries
                    if (self.retry == -1) {
                        self.getProgress();
                        self.initUpload();
                    }
                }
            }));
        }
	} catch (e) {
		//Restart upload
		if (self.retry > 0) {
			self.retry--;
			self.getProgress();
			self.initUpload();
		}
	}
};

//PUT every 5 seconds to get partial # of bytes uploaded
resumableUpload.prototype.startMonitoring = function() {
	var self = this;
	var options = {
		url: self.location,
		headers: {
		  'Authorization':	'Bearer ' + self.tokens.access_token,
		  'Content-Length':	0,
		  'Content-Range':	'bytes */' + self.filesize
		}
	};
	var healthCheck = function() { //Get # of bytes uploaded
		request.put(options, function(error, response, body) {
			if (!error && response.headers.range != undefined) {
				self.emit('progress', { uploadId: self.uploadId,
                    progress: ~~((parseInt(response.headers.range.substring(8, response.headers.range.length)) * 100) / parseInt(self.filesize)) });
				if (response.headers.range == self.filesize) {
					clearInterval(healthCheckInteral);
				}
			}
		});
	};
	var healthCheckInterval = setInterval(healthCheck, 5000);
};

//If an upload fails, get partial # of bytes. Called by putUpload()
resumableUpload.prototype.getProgress = function() {
	var self = this;
	var options = {
		url: self.location,
		headers: {
		  'Authorization':	'Bearer ' + self.tokens.access_token,
		  'Content-Length':	0,
		  'Content-Range':	'bytes */' + self.filesize
		}
	};
	request.put(options, function(error, response, body) {
		try {
			self.byteCount = response.headers.range.substring(8, response.headers.range.length); //parse response
		} catch (e) {
			self.emit('error', {uploadId: self.uploadId, error: e});
		}
	});
};
