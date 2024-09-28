import { ApiURL } from './config/config.json';

import { DateTime as luxon } from 'luxon';

const checkIfGameContains = (onlineGames, value) => {


    
    let element = null;
    onlineGames.forEach((el) => {
        
        if(el.game_name === value)
        {
            element = el;
            return;
        }
    });

    if(element == null) return -1;
    return element;

}

class Api {
    
    constructor() {

        if (Api._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        Api._instance = this;

        this.frStreamer = null;
        this.qcStreamers = null;

        this.listOnlineStreamers = null;

        this.isOnline = false;

        this.onUpdate = function() { };

        setInterval(async() => {
            await this.UpdateStreamersLists();
            await this.CheckIsOnline();
            this.onUpdate();
            // Signal()
        }, 25000);

        this.ListerStreamer.bind(this);
        this.CheckIsOnline.bind(this);

    }

    async CheckIsOnline() {
        console.log("CheckIsOnline", this.isOnline);

        await fetch(ApiURL).then(() => {
            this.isOnline = true;
            //alert();
        })
        .catch(() => {
            this.isOnline = false;
        });

    }

    filter() {

    }

    ListerStreamer(listStreamers) {
        let listOnline = [];
        let listOffline = [];

        if(listStreamers == null) return([]);

        listStreamers.forEach(element => {
            
            if(element.isStreaming)
            {
                listOnline.push(element);
            }
            else
            {
                listOffline.push(element);
            }

        });

        //Tri Alphabétique
        listOnline.sort((a, b) => {

            if(a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }

        });

        //Tri par viewer
        listOnline.sort((a, b) => {
            let lastStreamA = a.listLastedStream[0];
            let lastStreamB = b.listLastedStream[0];

            if(lastStreamA.viewer_count < lastStreamB.viewer_count)
            {
                return 1;
            }
            else if (lastStreamA.viewer_count > lastStreamB.viewer_count)
            {
                return -1;
            }
            else {
                return 0;
            }
            
        });

        //Tri Alphabétique
        listOffline.sort((a, b) => {

            if(a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }
            
        });
        
        let listRes = [];
        listRes = listOnline.concat(listOffline);

        return listRes;
    }

    async UpdateStreamersLists() {
        console.log("UpdateStreamersLists()");

        this.qcStreamers = await this.getQCStreamers(true);
        this.frStreamer = await this.getFrenchStreamers(true);

        this.frStreamer = this.ListerStreamer(this.frStreamer);
        this.qcStreamers = this.ListerStreamer(this.qcStreamers);

        this.listOnlineStreamers = await this._getOnlineStreamers(true);
    }

    async getGamesOnLive() {

        let onlineStreamers = await this.getOnlineStreamers();
        
        let onlineGames = [];
        
        for (const element of onlineStreamers) {
            
            let lastStream = element.listLastedStream[0];

            let checkContains = checkIfGameContains(onlineGames, lastStream.game_name);
            
            if(checkContains === -1)
            {   

                let gameBoxArt = await this.request_gameBox(lastStream.id);
    
                let Game = {
                    id: lastStream.id,
                    game_name: lastStream.game_name,
                    gameBoxArt: gameBoxArt,
                    game_views: lastStream.viewer_count
                };
    
                onlineGames.push(Game);

            }
            else {

                onlineGames.forEach((element) => {
                    if(element.game_name == lastStream.game_name)
                    {
                        element.game_views += lastStream.viewer_count;
                    }
                });

            }

        }

        return Array.from(onlineGames);

    }

    async getGamesInfoInCategory(gameID) {
        let onlineStreamers = await this.getOnlineStreamers();

        let onlineGames = [];
        
        let decodedURI = "";
        try {
            decodedURI = decodeURIComponent(gameID);
        } catch (e) {
            // Catches a malformed URI
            console.error(e);
        }

        for (const element of onlineStreamers) {
            
            let lastStream = element.listLastedStream[0];
            
            if(lastStream.game_name == decodedURI)
            {
                
                let gameBoxArt = await this.request_gameBox(lastStream.id);
    
                let Game = {
                    id: lastStream.id,
                    game_name: lastStream.game_name,
                    gameBoxArt: gameBoxArt,
                    game_views: lastStream.viewer_count
                };
    
                let findGame = false;
                onlineGames.forEach((element) => {
                    if(element.game_name == lastStream.game_name)
                    {
                        element.game_views += lastStream.viewer_count;
                        findGame = true;
                    }
                });

                if(!findGame)
                    onlineGames.push(Game);
                
                
            }

        }

        /*onlineStreamers.forEach(async (element) => {
            


        });*/

        return Array.from(onlineGames);

    }

    async getStreamers() {
        console.log("getStreamers()");

        let streamers = [];
        streamers = await this.getQCStreamers();
        streamers = streamers.concat(await this.getFrenchStreamers());

        return streamers;
    }

    async getStreamer(name) {
        let streamers = await this.getStreamers();

        let el = null;
        for (const element of streamers) {
            if(element.name == name)
            {
                el = element;
                break;
            }
        }

        return el;
    }

    async getRandomStreamer() {
        let onlineStreamers = await this.getOnlineStreamers();

        const random = Math.floor(Math.random() * onlineStreamers.length);
        
        return onlineStreamers[random];
    }

    async getLastedEventsStreamers() {
        let eventsStreamers = await this.request_lastedEventsStreamers();

        //Tri par date, du plus récent au plus vieux
        eventsStreamers.sort((a, b) => {

            let aDate = luxon.fromISO(a.event.start);
            let bDate = luxon.fromISO(b.event.start);

            if(aDate.startOf("day") < bDate.startOf("day"))
            {
                return 1;
            }
            else if (aDate.startOf("day") > bDate.startOf("day"))
            {
                return -1;
            }
            else
            {
                return 0;
            }
        });

        return eventsStreamers;
    }

    async getEventsStreamers() {
        let eventsStreamers = await this.request_eventsStreamers();

        //Tri par date, du plus récent au plus vieux
        eventsStreamers.sort((a, b) => {

            let aDate = luxon.fromISO(a.event.start);
            let bDate = luxon.fromISO(b.event.start);

            if(aDate.startOf("day") < bDate.startOf("day"))
            {
                return 1;
            }
            else if (aDate.startOf("day") > bDate.startOf("day"))
            {
                return -1;
            }
            else
            {
                return 0;
            }
            /*if( > b.event.start) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }*/

        });

        return eventsStreamers;
    }

    async getOnlineStreamers(forceUpdate) {
        if(this.listOnlineStreamers == null || forceUpdate)
        {
            this.listOnlineStreamers = await this._getOnlineStreamers();
        }

        return this.listOnlineStreamers;
    }

    async _getOnlineStreamers() {

        if(this.qcStreamers == null || this.frStreamer == null) { 
            //Init phase
            await this.UpdateStreamersLists(); 
            await this.CheckIsOnline(); 
            this.onUpdate();
        }

        let listOnline = [];

        this.frStreamer.forEach(element => {
            
            if(element.isStreaming)
            {
                listOnline.push(element);
            }

        });

        this.qcStreamers.forEach(element => {
            
            if(element.isStreaming)
            {
                listOnline.push(element);
            }

        });

        //Tri Alphabétique
        listOnline.sort((a, b) => {
            if(a.name > b.name) {
                return 1;
            }
            return 0;
        });

        //Tri par viewer
        listOnline.sort((a, b) => {
            let lastStreamA = a.listLastedStream[0];
            let lastStreamB = b.listLastedStream[0];

            if(lastStreamA.viewer_count < lastStreamB.viewer_count)
            {
                return 1;
            }
            return 0;
        });

        return listOnline;

    }
    
    async getOnlineStreamersInCategory(nameCategory) {
        console.log("getOnlineStreamersInCategory(nameCategory)");

        let onlineStreamers = await this.getOnlineStreamers();

        let decodedURI = "";
        try {
            decodedURI = decodeURIComponent(nameCategory);
        } catch (e) {
            // Catches a malformed URI
            console.error(e);
        }

        let listOnline = [];

        onlineStreamers.forEach(element => {
            
            let lastStream = element.listLastedStream[0];

            if(lastStream.game_name == decodedURI)
            {
                listOnline.push(element);
            }

        });

        return listOnline;

    }

    async getQCStreamers(forceUpdate = false) {
        console.log("getQCStreamers()");

        if(this.qcStreamers == null || forceUpdate)
        {
            this.qcStreamers = await this.request_qcStreamers();

            this.qcStreamers = this.ListerStreamer(this.qcStreamers);
        }

        return this.qcStreamers;
    }

    async getFrenchStreamers(forceUpdate = false) {
        console.log("getFrenchStreamers()");

        if(this.frStreamer == null || forceUpdate)
        {
            this.frStreamer = await this.request_frStreamers();

            this.frStreamer = this.ListerStreamer(this.frStreamer);
        }

        return this.frStreamer;
    }

    /* REGION: REQUESTS API */
    async request_getStreamers() {
        console.log("request_getStreamers()");

        const options = {
            method: 'GET'
        };
          
        let res = null;

        /*fetch(ApiURL + '/api/v1/streamers/', options)
            .then(response => response.json())
            .then(response => res = response)
            .catch(err => console.error(err));*/
        
        return res;
    }

    async request_frStreamers() {
        console.log("request_frStreamers()");

        const options = {
            method: 'GET',
        };

        let res = null;
          
        /*res = await fetch(ApiURL + '/api/v1/streamers/fr-streamers', options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));*/

        return res;
    }

    async request_qcStreamers() {
        console.log("request_qcStreamers()");

        const options = {
            method: 'GET',
        };

        let res = null;
          
        /*res = await fetch(ApiURL + '/api/v1/streamers/qc-streamers', options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));*/

        return res;

    }

    async request_gameBox(idGame) {
        console.log("request_gameBox()");

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({id: idGame})
        };

        let res = null;
          
        /*res = await fetch(ApiURL + '/api/v1/streamers/games', options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));*/

        return res;

    }

    async request_lastedEventsStreamers()
    {
        console.log("request_lastedEventsStreamers()");

        const options = {
            method: 'GET'
        };

        let res = null;
          
        /*res = await fetch(ApiURL + '/api/v1/streamers/lasted-event-streamers', options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));*/

        return res;
    }

    async request_eventsStreamers()
    {
        console.log("request_eventsStreamers()");

        const options = {
            method: 'GET'
        };

        let res = null;
          
        /*res = await fetch(ApiURL + '/api/v1/streamers/event-streamers', options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));*/

        return res;
    }

}

var instance = new Api(); // Executes succesfully

export default instance;
