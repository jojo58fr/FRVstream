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

    }

    /* REGION: REQUESTS API */
    async request_login(login, password) {
        console.log("request_login()", login, password);

        const options = {
            method: 'POST',
            headers: {
              username: login,
              password: password,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include', // Need to add this header for sid cookie.
            body: new URLSearchParams({username: login, password: password})
        };
          
        let res = null;

        await fetch(ApiURL + '/api/v1/auth/login', options)
            .then(response => {console.log(response); res = response})
            .catch(err => {console.error(err); res = err});
        
        

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
            headers: {
              username: login,
              password: password,
              email: email,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({username: login, password: password, email: email})
        };
          
        let res = null;

        await fetch(ApiURL + '/api/v1/auth/register', options)
            .then(response => {res = response})
            .catch(err => {console.error(err); res = err});
        
        if(res != null && (res.status == 409 || res.status == 400))
        {
            return -1;
        }
        else if (res != null && res.status == 201)
        {
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
        
        await fetch('http://localhost/api/v1/auth/status', options)
            .then(response => { isLogged = true; res = response.json(); })
            .catch(err => {console.error(err); res = err});

        //this._isLogged = isLogged;

        return res;

    }

    async request_logout() {
        console.log("request_logout()");
        
        const options = {
            method: 'POST',
            credentials: 'include', // Need to add this header for sid cookie.
        };

        let res = null;

        await fetch('http://localhost/api/v1/auth/logout', options)
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