Meteor.methods({
   doYoutube: function () {
       if (! Meteor.userId()) { throw new Meteor.Error("not-authorized"); }
       var Youtube = Meteor.npmRequire("youtube-api");
       Youtube.authenticate({
           type: "oauth",
           token: Meteor.user().services.google.accessToken
       });
       Youtube.channels.list({
           "part": "id",
           "mySubscribers": true,
           "maxResults": 50
       }, console.log);
   }
});

if (Meteor.isServer) {
    Meteor.startup(function () {});
}