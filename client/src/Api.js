import { ApiURL } from './config/config.json';

import { DateTime as luxon } from 'luxon';

const envApiUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : null;
const API_BASE = (envApiUrl ?? ApiURL ?? '').replace(/\/+$/, '');
const buildApiUrl = (path) => `${API_BASE}${path?.startsWith('/') ? '' : '/'}${path ?? ''}`;

const buildTwitchBoxArtUrl = (gameName, width = 600, height = 800) => {
    if (!gameName) {
        return null;
    }
    return `https://static-cdn.jtvnw.net/ttv-boxart/${encodeURIComponent(gameName)}-${width}x${height}.jpg`;
};

const normalizeBoxArtUrl = (gameInfo, gameName, { width = 600, height = 800 } = {}) => {
    const raw = gameInfo?.box_art_url
        ?? gameInfo?.boxArtUrl
        ?? gameInfo?.cover_url
        ?? gameInfo?.coverUrl
        ?? gameInfo?.url;

    if (typeof raw === 'string') {
        if (raw.includes('{width}')) {
            return raw.replace('{width}', String(width)).replace('{height}', String(height));
        }
        return raw;
    }

    return buildTwitchBoxArtUrl(gameName, width, height);
};

const mapGameInfosById = (gameInfos) => {
    const map = new Map();
    if (!Array.isArray(gameInfos)) {
        return map;
    }

    gameInfos.forEach((info) => {
        const key = info?.id ?? info?.game_id ?? info?.gameId ?? info?.twitch_id;
        if (key !== undefined && key !== null) {
            map.set(String(key), info);
        }
    });
    return map;
};

class Api {
    
    constructor() {

        if (Api._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        Api._instance = this;

        this.frStreamer             = null;
        this.qcStreamers            = null;

        this.listOnlineStreamers    = null;
        this.listOnlineGames        = null;
        this.favorites              = null;
        this.favoriteStreams        = null;

        this.isApiOnline            = false;

        this.onUpdate = function() { };
        this.updateListeners = new Set();

        setInterval(async() => {
            await this.UpdateStreamersLists();
            await this.CheckIsOnline();
            this._emitUpdate();
            // Signal()
        }, 25000);

        this.ListerStreamer.bind(this);
        this.CheckIsOnline.bind(this);

    }
    
    async _getOnlineStreamers() {

    }


    async CheckIsOnline() {
        console.log("CheckIsOnline", this.isApiOnline);

        await fetch(buildApiUrl('')).then(() => {
            this.isApiOnline = true;
            //alert();
        })
        .catch(() => {
            this.isApiOnline = false;
        });

    }

    filter() {

    }

    addUpdateListener(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }
        this.updateListeners.add(listener);
        return () => this.updateListeners.delete(listener);
    }

    _emitUpdate() {
        if (typeof this.onUpdate === 'function') {
            try {
                this.onUpdate();
            } catch (error) {
                console.error('API.onUpdate callback failed', error);
            }
        }

        this.updateListeners.forEach((listener) => {
            try {
                listener();
            } catch (error) {
                console.error('API update listener failed', error);
            }
        });
    }

    ListerStreamer(listStreamers) {
        let listOnline = [];
        let listOffline = [];

        if(listStreamers == null) return([]);

        listStreamers.forEach(element => {
            
            if(element !== null)
            {
                if(element.isStreaming)
                {
                    listOnline.push(element);
                }
                else
                {
                    listOffline.push(element);
                }
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

    async UpdateStreamersLists(forceRefresh = false) {
        console.log("UpdateStreamersLists()");

        this.qcStreamers = await this.getQCStreamers(forceRefresh);
        this.frStreamer = await this.getFrenchStreamers(forceRefresh);

        this.frStreamer = this.ListerStreamer(this.frStreamer);
        this.qcStreamers = this.ListerStreamer(this.qcStreamers);

        this.listOnlineStreamers    = await this._getOnlineStreamers(true);
        //this.listOnlineGames        = await this._getOnlineGames(true);
    }

    async getGamesOnLive() {

        let onlineStreamers = await this.getOnlineStreamers();
        
        let onlineGames = [];
        
        for (const element of onlineStreamers) {
            
            let lastStream = element.listLastedStream?.[0];
            if (!lastStream || !lastStream.game_name) {
                continue;
            }
            const gameId = lastStream.game_id ?? lastStream.gameId ?? lastStream.id;
            const existing = onlineGames.find((entry) =>
                (gameId && entry.game_id === gameId) || entry.game_name === lastStream.game_name
            );
            if (!existing) {
                onlineGames.push({
                    id: gameId,
                    game_id: gameId,
                    game_name: lastStream.game_name,
                    game_views: lastStream.viewer_count
                });
            } else {
                existing.game_views += lastStream.viewer_count;
            }

        }

        const gameIds = onlineGames.map((game) => game.game_id ?? game.id).filter(Boolean);
        let gameInfos = [];
        if (gameIds.length > 0) {
            try {
                gameInfos = await this.request_games(gameIds);
            } catch (error) {
                console.error('getGamesOnLive: unable to fetch game info', error);
            }
        }
        const infoMap = mapGameInfosById(gameInfos);

        return Array.from(onlineGames).map((game) => {
            const info = infoMap.get(String(game.game_id)) || infoMap.get(String(game.id));
            return {
                ...game,
                gameBoxArt: info ?? null,
                gameBoxArtUrl: normalizeBoxArtUrl(info, game.game_name, { width: 285, height: 380 })
            };
        });

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
            
            let lastStream = element.listLastedStream?.[0];
            if (!lastStream || !lastStream.game_name) {
                continue;
            }
            
            if(lastStream.game_name == decodedURI)
            {
                const gameId = lastStream.game_id ?? lastStream.gameId ?? lastStream.id;

                const existing = onlineGames.find((entry) =>
                    (gameId && entry.game_id === gameId) || entry.game_name === lastStream.game_name
                );

                if (existing) {
                    existing.game_views += lastStream.viewer_count;
                } else {
                    onlineGames.push({
                        id: gameId,
                        game_id: gameId,
                        game_name: lastStream.game_name,
                        game_views: lastStream.viewer_count
                    });
                }
            }

        }

        const gameIds = onlineGames.map((game) => game.game_id ?? game.id).filter(Boolean);
        let gameInfos = [];
        if (gameIds.length > 0) {
            try {
                gameInfos = await this.request_games(gameIds);
            } catch (error) {
                console.error('getGamesInfoInCategory: unable to fetch game info', error);
            }
        }
        const infoMap = mapGameInfosById(gameInfos);

        return Array.from(onlineGames).map((game) => {
            const info = infoMap.get(String(game.game_id)) || infoMap.get(String(game.id));
            return {
                ...game,
                gameBoxArt: info ?? null,
                gameBoxArtUrl: normalizeBoxArtUrl(info, game.game_name, { width: 285, height: 380 })
            };
        });

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
        try {
            let eventsStreamers = await this.request_lastedEventsStreamers();
            if (!Array.isArray(eventsStreamers)) {
                return [];
            }

            eventsStreamers.sort((a, b) => {
                const aDate = luxon.fromISO(a?.event?.start ?? a?.start ?? null);
                const bDate = luxon.fromISO(b?.event?.start ?? b?.start ?? null);

                if (!aDate.isValid && !bDate.isValid) return 0;
                if (!aDate.isValid) return 1;
                if (!bDate.isValid) return -1;
                return aDate.toMillis() - bDate.toMillis();
            });

            return eventsStreamers;
        } catch (error) {
            console.error('getLastedEventsStreamers failed', error);
            return [];
        }
    }

    async getEventsStreamers() {
        try {
            let eventsStreamers = await this.request_eventsStreamers();
            if (!Array.isArray(eventsStreamers)) {
                return [];
            }

            eventsStreamers.sort((a, b) => {
                const aDate = luxon.fromISO(a?.event?.start ?? a?.start ?? null);
                const bDate = luxon.fromISO(b?.event?.start ?? b?.start ?? null);

                if (!aDate.isValid && !bDate.isValid) return 0;
                if (!aDate.isValid) return 1;
                if (!bDate.isValid) return -1;
                return aDate.toMillis() - bDate.toMillis();
            });

            return eventsStreamers;
        } catch (error) {
            console.error('getEventsStreamers failed', error);
            return [];
        }
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
            await this.UpdateStreamersLists(true); 
            await this.CheckIsOnline(); 

            //TODO On doit pouvoir récup plusieurs vignettes rigolotes de twouitch
            console.log("REQUEST_GAAAAMES");
            console.log( this.request_games(['41108504085', '41109218325', '39375799716']) );

            this._emitUpdate();
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
            console.log("FIRST INITIALIZATION")
            this.frStreamer = await this.request_frStreamers();
            console.log("FRStreamer FI: ", this.frStreamer);

            this.frStreamer = this.ListerStreamer(this.frStreamer);
        }

        console.log("FRStreamer: ", this.frStreamer);
        return this.frStreamer;
    }

    /* REGION: REQUESTS API */
    async request_getStreamers() {
        console.log("request_getStreamers()");

        const options = {
            method: 'GET'
        };
          
        let res = null;

        fetch(buildApiUrl('/api/v1/streamers/'), options)
            .then(response => response.json())
            .then(response => res = response)
            .catch(err => console.error(err));
        
        return res;
    }

    async request_frStreamers() {
        console.log("request_frStreamers()");

        const options = {
            method: 'GET',
        };

        let res = null;
          
        res = await fetch(buildApiUrl('/api/v1/streamers/fr-streamers'), options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));

        return res;
    }

    async request_qcStreamers() {
        console.log("request_qcStreamers()");

        const options = {
            method: 'GET',
        };

        let res = null;
          
        res = await fetch(buildApiUrl('/api/v1/streamers/qc-streamers'), options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));

        return res;

    }

    async getFavorites(forceUpdate = false) {
        if (this.favorites !== null && !forceUpdate) {
            return this.favorites;
        }

        try {
            const response = await fetch(buildApiUrl('/api/v1/streamers/favorites'), {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                return [];
            }

            const payload = await response.json();
            this.favorites = payload ?? [];
            return this.favorites;
        } catch (error) {
            console.error('getFavorites failed', error);
            return [];
        }
    }

    async getFavoriteStreams(forceUpdate = false) {
        if (this.favoriteStreams !== null && !forceUpdate) {
            return this.favoriteStreams;
        }

        try {
            const response = await fetch(buildApiUrl('/api/v1/streamers/favorites/streams'), {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                return [];
            }

            const payload = await response.json();
            this.favoriteStreams = payload ?? [];
            return this.favoriteStreams;
        } catch (error) {
            console.error('getFavoriteStreams failed', error);
            return [];
        }
    }

    async addFavorite(vtuberId) {
        if (!vtuberId) {
            return null;
        }

        try {
            const response = await fetch(buildApiUrl('/api/v1/streamers/favorites'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ vtuberId })
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            if (payload?.vtuber) {
                this.favorites = Array.isArray(this.favorites)
                    ? [payload.vtuber, ...this.favorites.filter((item) => item?.id !== vtuberId)]
                    : [payload.vtuber];
            }
            return payload;
        } catch (error) {
            console.error('addFavorite failed', error);
            return null;
        }
    }

    async removeFavorite(vtuberId) {
        if (!vtuberId) {
            return null;
        }

        try {
            const response = await fetch(buildApiUrl(`/api/v1/streamers/favorites/${vtuberId}`), {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                return null;
            }

            if (Array.isArray(this.favorites)) {
                this.favorites = this.favorites.filter((item) => item?.id !== vtuberId);
            }

            const payload = await response.json().catch(() => ({}));
            return payload ?? { ok: true };
        } catch (error) {
            console.error('removeFavorite failed', error);
            return null;
        }
    }

    async getTrends(limit = 10) {
        const query = Number.isFinite(limit) ? `?limit=${limit}` : '';
        try {
            const response = await fetch(buildApiUrl(`/api/v1/streamers/trends${query}`), {
                method: 'GET'
            });

            if (!response.ok) {
                return [];
            }

            const payload = await response.json();
            return payload ?? [];
        } catch (error) {
            console.error('getTrends failed', error);
            return [];
        }
    }

    async getStatsOverview() {
        try {
            const response = await fetch(buildApiUrl('/api/v1/streamers/stats'), {
                method: 'GET'
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            return payload ?? null;
        } catch (error) {
            console.error('getStatsOverview failed', error);
            return null;
        }
    }

    async getStatsLive() {
        try {
            const response = await fetch(buildApiUrl('/api/v1/streamers/stats/live'), {
                method: 'GET'
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            return payload ?? null;
        } catch (error) {
            console.error('getStatsLive failed', error);
            return null;
        }
    }

    async getStatsForecast(days) {
        const query = Number.isFinite(days) ? `?days=${days}` : '';
        try {
            const response = await fetch(buildApiUrl(`/api/v1/streamers/stats/forecast${query}`), {
                method: 'GET'
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            return payload ?? null;
        } catch (error) {
            console.error('getStatsForecast failed', error);
            return null;
        }
    }

    async getStatsHistory({ from, to, group = 'day', days } = {}) {
        const params = new URLSearchParams();

        if (Number.isFinite(days)) {
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(toDate.getDate() - days);
            params.append('from', fromDate.toISOString());
            params.append('to', toDate.toISOString());
        } else {
            if (from) {
                params.append('from', from);
            }
            if (to) {
                params.append('to', to);
            }
        }

        if (group) {
            params.append('group', group);
        }

        const query = params.toString() ? `?${params.toString()}` : '';

        try {
            const response = await fetch(buildApiUrl(`/api/v1/streamers/stats/history${query}`), {
                method: 'GET'
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            return payload ?? null;
        } catch (error) {
            console.error('getStatsHistory failed', error);
            return null;
        }
    }

    async getCommunityEvents(status = 'approved') {
        const query = status ? `?status=${encodeURIComponent(status)}` : '';
        try {
            const response = await fetch(buildApiUrl(`/api/v1/calendar/community${query}`), {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                return [];
            }

            const payload = await response.json();
            return payload ?? [];
        } catch (error) {
            console.error('getCommunityEvents failed', error);
            return [];
        }
    }

    async createCommunityEvent(payload) {
        try {
            const response = await fetch(buildApiUrl('/api/v1/calendar/community'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload ?? {})
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('createCommunityEvent failed', response.status, errorText);
                return null;
            }

            const data = await response.json().catch(() => ({}));
            return data ?? null;
        } catch (error) {
            console.error('createCommunityEvent threw', error);
            return null;
        }
    }

    async approveCommunityEvent(id) {
        if (!id) return null;
        try {
            const response = await fetch(buildApiUrl(`/api/v1/calendar/community/${id}/approve`), {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('approveCommunityEvent failed', response.status);
                return null;
            }

            const data = await response.json().catch(() => ({}));
            return data ?? { ok: true };
        } catch (error) {
            console.error('approveCommunityEvent threw', error);
            return null;
        }
    }

    async rejectCommunityEvent(id) {
        if (!id) return null;
        try {
            const response = await fetch(buildApiUrl(`/api/v1/calendar/community/${id}/reject`), {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('rejectCommunityEvent failed', response.status);
                return null;
            }

            const data = await response.json().catch(() => ({}));
            return data ?? { ok: true };
        } catch (error) {
            console.error('rejectCommunityEvent threw', error);
            return null;
        }
    }

    async trackClick({ vtuberId, streamId }) {
        if (!vtuberId && !streamId) {
            return null;
        }

        try {
            const response = await fetch(buildApiUrl('/api/v1/streamers/clicks'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    vtuberId,
                    streamId
                })
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json().catch(() => ({}));
            return payload ?? { ok: true };
        } catch (error) {
            console.error('trackClick failed', error);
            return null;
        }
    }

    async syncAuthSession() {
        const url = buildApiUrl('/api/v1/auth/sync');
        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.status === 401) {
                return { unauthorized: true };
            }

            if (!response.ok) {
                console.error('syncAuthSession failed', response.status, response.statusText);
                return null;
            }

            const payload = await response.json();
            return payload;
        } catch (error) {
            console.error('syncAuthSession threw', error);
            return null;
        }
    }

    async request_games(idGames) {
        console.log("request_gameBox()");

        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({id: idGames})
        };

        if(Array.isArray(idGames))
        {
            options.body = new URLSearchParams(idGames.map(s=>['id',s]));
        }

        let res = null;
          
        res = await fetch(buildApiUrl('/api/v1/streamers/games'), options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));

        return res;

    }

    async request_lastedEventsStreamers()
    {
        console.log("request_lastedEventsStreamers()");

        const options = {
            method: 'GET'
        };

        let res = null;
          
        res = await fetch(buildApiUrl('/api/v1/streamers/lasted-event-streamers'), options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));

        return res;
    }

    async request_eventsStreamers()
    {
        console.log("request_eventsStreamers()");

        const options = {
            method: 'GET'
        };

        let res = null;
          
        res = await fetch(buildApiUrl('/api/v1/streamers/event-streamers'), options)
            .then(response => {return response.json();})
            .catch(err => console.error(err));

        return res;
    }

}

var instance = new Api(); // Executes succesfully

export default instance;
