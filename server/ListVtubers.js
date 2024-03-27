const { TwitchApi } = require("./TwitchApi");

class ListVtubers {
    
    constructor() {

        if (ListVtubers._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        ListVtubers._instance = this;

        this.twitchApi = new TwitchApi(this);

        this.initListStreamers.bind(this);

        this.initListStreamers();
    }

    initListStreamers() {

        console.log(`[TwitchApi] Construction de la liste des streameurs à suivre...`);

        //Ajout d'un streamer
        this.twitchApi.addStreamer("TakuDev", (streamer) => {

            streamer.OnStartedStream = function() {
                console.log(`[TwitchApi] Lancement du live de l'utilisateur ${streamer?.name}`);
            }
    
            streamer.OnUpdatedStream = function() {
                console.log(`[TwitchApi] MAJ du live de l'utilisateur ${streamer?.name}`);
            }

            streamer.OnEndedStream = function() {
                console.log(`[TwitchApi] Fin du live de l'utilisateur ${streamer?.name}`);
            }

        });

        //Ajout d'un streamer deuxième test
        this.twitchApi.addStreamer("Missflamme", (streamer) => {

            streamer.OnStartedStream = function() {
                console.log(`[TwitchApi] Lancement du live de l'utilisateur ${streamer?.name}`);
            }
    
            streamer.OnUpdatedStream = function() {
                console.log(`[TwitchApi] MAJ du live de l'utilisateur ${streamer?.name}`);
            }

            streamer.OnEndedStream = function() {
                console.log(`[TwitchApi] Fin du live de l'utilisateur ${streamer?.name}`);
            }

        });

        //Ajout d'un streamer deuxième test
        this.twitchApi.addStreamer("Mymikubot", (streamer) => {

            streamer.OnStartedStream = function() {
                console.log(`[TwitchApi] Lancement du live de l'utilisateur ${streamer?.name}`);
            }
    
            streamer.OnUpdatedStream = function() {
                console.log(`[TwitchApi] MAJ du live de l'utilisateur ${streamer?.name}`);
            }

            streamer.OnEndedStream = function() {
                console.log(`[TwitchApi] Fin du live de l'utilisateur ${streamer?.name}`);
            }

        });

    }

    getStreamers() {

        let that = this;

        console.log("getListStreamers()");
        return this.twitchApi.getListStreamers();
    }

}

var instance = new ListVtubers(); // Executes succesfully

exports.instance = instance;