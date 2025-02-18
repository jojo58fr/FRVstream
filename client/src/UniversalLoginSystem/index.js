import axios from 'axios';
//import axiosRetry from 'axios-retry';

import { ApiURL } from '../config/config.json';

class UniversalLoginSystem {
    
    constructor() {

        if (UniversalLoginSystem._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        UniversalLoginSystem._instance = this;

        this._isLogged = false;

        setInterval(async() => {
            //this.onUpdate();
            // Signal()
        }, 25000);

        this.Api = axios.create({
            withCredentials: true,
            baseUrl: ApiURL
        });

    }

    /* REGION: REQUESTS API */
    async request_login(login, password) {
        console.log("request_login()", login, password);

        const options = {
            method: 'POST',
            url: ApiURL + '/api/v1/auth/login',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true,
            data: new URLSearchParams({ username: login, password: password }),
        };
          
        let res = null;

        res = await this.Api(options);

        console.log("HEY RES", res);

        if(res !== null && res.status == 200)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }

    async request_register(login, password, email) {
        console.log("request_register()", login, password, email);

        const options = {
            method: 'POST',
            url: ApiURL + '/api/v1/auth/register',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true,
            body: new URLSearchParams({username: login, password: password, email: email})
        };
          
        let res = null;

        /*await fetch(ApiURL + '/api/v1/auth/register', options)
            .then(response => {res = response})
            .catch(err => {console.error(err); res = err});*/
        res = await axios(options);

        console.log("REGISTER", options);
        
        if(res != null && (res.status == 409 || res.status == 400))
        {
            return -1;
        }
        else if (res != null && res.status == 201)
        {
            this.isLogged = true;
            return 1;
        }
        
        return 0;
    }

    isLogged() {
        return this._isLogged;
    }

    async request_status() {
        console.log("request_status()");
        
        const options = {
            method: 'GET',
            credentials: 'include', // Need to add this header for sid cookie.
        };

        let res = null;
        let isLogged = false;
        
        await fetch(ApiURL + '/api/v1/auth/status', options)
            .then(response => { this._isLogged = true; res = response.json(); })
            .catch(err => {console.error(err); res = err});

        //this._isLogged = isLogged;

        console.log("/api/v1/auth/status", res);

        return res;

    }

    async request_logout() {
        console.log("request_logout()");
        
        const options = {
            method: 'POST',
            credentials: 'include', // Need to add this header for sid cookie.
        };

        let res = null;

        await fetch(ApiURL + '/api/v1/auth/logout', options)
            .then(response => { res = response })
            .catch(err => {console.error(err); res = err});

        if(res != null && (res.status == 401 || res.status == 400))
        {
            return -1;
        }
        else if (res != null && res.status == 200)
        {
            this._isLogged = false;
            return 1;
        }
        
        return 0;
    }

}


var instance = new UniversalLoginSystem(); // Executes succesfully

export default instance;