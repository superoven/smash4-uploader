Emails = new Mongo.Collection("emails");

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

function make_char_url(char_id) {
    return (char_id.length > 0) ? '/img/portraits/' + char_id + '_01.png' : '/img/portraits/omakase_01.png';
}

function render(player1_img, player1_name, player2_img, player2_name) {
    images = {
        'bg': '/img/bg.png',
        'player1': make_char_url(player1_img),
        'player2': make_char_url(player2_img)
    };
    loadImages(images, function (res) {
        var c = $("#myCanvas")[0];
        var ctx = c.getContext("2d");
        ctx.font = "30px Arial";
        ctx.drawImage(res.bg, 0, 0);
        ctx.drawImage(res.player1, 0, 30);
        ctx.fillText(player1_name, 100, 50);
        ctx.translate(800, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(res.player2, 0, 30);
        ctx.translate(800, 0);
        ctx.scale(-1, 1);
        ctx.fillText(player2_name, 550, 50);
    });
}

if (Meteor.isClient) {
    Template.body.helpers({
        emails: function () {
            if (Session.get("hideCompleted")) {
                return Emails.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            } else {
                return Emails.find({}, {sort: {createdAt: -1}});
            }
        },
        hideComplete: function () {
            return Session.get('hideComplete');
        },
        characters: function () {
            return [
                {'id': 'captain', 'name': 'Captain Falcon'},
                {'id': 'dedede', 'name': 'King Dedede'},
                {'id': 'diddy', 'name': 'Diddy Kong'},
                {'id': 'donkey', 'name': 'DK'},
                {'id': 'drmario', 'name': 'Dr. Mario'},
                {'id': 'duckhunt', 'name': 'Duck Hunt'},
                {'id': 'falco', 'name': 'Falco'},
                {'id': 'fox', 'name': 'Fox'},
                {'id': 'gamewatch', 'name': 'Mr. Game & Watch'},
                {'id': 'ganon', 'name': 'Ganondorf'},
                {'id': 'gekkouga', 'name': 'Greninja'},
                {'id': 'ike', 'name': 'Ike'},
                {'id': 'kirby', 'name': 'Kirby'},
                {'id': 'koopa', 'name': 'Bowser'},
                {'id': 'koopajr', 'name': 'Bowser Jr.'},
                {'id': 'link', 'name': 'Link'},
                {'id': 'littlemac', 'name': 'Little Mac'},
                {'id': 'lizardon', 'name': 'Charizard'},
                {'id': 'lucario', 'name': 'Lucario'},
                {'id': 'lucina', 'name': 'Lucina'},
                {'id': 'luigi', 'name': 'Luigi'},
                {'id': 'mario', 'name': 'Mario'},
                {'id': 'marth', 'name': 'Marth'},
                {'id': 'metaknight', 'name': 'Meta Knight'},
                {'id': 'miifighter', 'name': 'Mii Brawler'},
                {'id': 'miigunner', 'name': 'Mii Gunner'},
                {'id': 'miiswordsman', 'name': 'Mii Swordsman'},
                {'id': 'murabito', 'name': 'Villager'},
                {'id': 'ness', 'name': 'Ness'},
                {'id': 'omakase', 'name': 'Random'},
                {'id': 'pacman', 'name': 'Pacman'},
                {'id': 'palutena', 'name': 'Palutena'},
                {'id': 'peach', 'name': 'Peach'},
                {'id': 'pikachu', 'name': 'Pikachu'},
                {'id': 'pikmin', 'name': 'Olimar'},
                {'id': 'pit', 'name': 'Pit'},
                {'id': 'pitb', 'name': 'Dark Pit'},
                {'id': 'purin', 'name': 'Jigglypuff'},
                {'id': 'reflet', 'name': 'Robin'},
                {'id': 'robot', 'name': 'ROB'},
                {'id': 'rockman', 'name': 'Megaman'},
                {'id': 'rosetta', 'name': 'Rosalina'},
                {'id': 'samus', 'name': 'Samus'},
                {'id': 'sheik', 'name': 'Sheik'},
                {'id': 'shulk', 'name': 'Shulk'},
                {'id': 'sonic', 'name': 'Sonic'},
                {'id': 'szerosuit', 'name': 'Zero Suit Samus'},
                {'id': 'toonlink', 'name': 'Toon Link'},
                {'id': 'wario', 'name': 'Wario'},
                {'id': 'wiifit', 'name': 'Wii Fit Trainer'},
                {'id': 'yoshi', 'name': 'Yoshi'},
                {'id': 'zelda', 'name': 'Zelda'}
            ];
        }
    });

    Template.body.rendered = function() {
        if(!this._rendered) {
            this._rendered = true;
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
        }
    };

    Template.body.events({
        "submit .new-email": function (event) {
            var text = event.target.text.value;
            Emails.insert({
                text: text,
                createdAt: new Date() // current time
            });
            event.target.text.value = "";
            return false;
        },
        "change .hide-completed input": function (event) {
            Session.set("hideCompleted", event.target.checked);
        },
        "change .player1-character": function (event) {
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
            return false;
        },
        "change .player2-character": function (event) {
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
            return false;
        },
        "change .player1-name": function (event) {
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
            return false;
        },
        "change .player2-name": function (event) {
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
            return false;
        },
        "click .bruh": function (event) {
            render($(".player1-character").val(), $(".player1-name").val(), $(".player2-character").val(), $(".player2-name").val());
            return false;
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {});
}
