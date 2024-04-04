const mysql = require('mysql');

class Database {
    
    constructor() {

        if (Database._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        Database._instance = this;

        this._initConnection = mysql.createConnection({
            host     : '127.0.0.1',
            user     : 'root',
            password : 'root',
            /*database: 'frvtubers_streamers'*/
        });

        this._connection = mysql.createConnection({
            host     : '127.0.0.1',
            user     : 'root',
            password : 'root',
            database: 'frvtubers_streamers'
        });

        
        this._isConnected = false;
        

        this.initDatabase.bind(this);
        this.initConnection.bind(this);
    }

    //Run to install the DB
    initDatabase() {

        var that = this;

        this._initConnection.connect(function(err) {

            if (err) {
              console.error('[INIT DATABASE] error connecting: ' + err.stack);
              that._isConnected = false;
              return;
            }
           
            console.log(`Initialisation de la database... [${that._initConnection.threadId}]`);

            that._initConnection.query('CREATE DATABASE IF NOT EXISTS frvtubers_streamers;', function (error, results, fields) {
                if (error) throw error;
                console.log('[INIT DATABASE] SUCCESS INIT frvtubers_streamers');
            })


            that.initConnection();
        });


    }

    initConnection() {

        var that = this;

        this._connection.connect(function(err) {

            if (err) {
              console.error('error connecting: ' + err.stack);
              
              that._isConnected = false;
              return;
            }
           
            console.log(`Connecté en tant que l'id [${that._connection.threadId}]`);
            that._isConnected = true;
        });

    }



}

var instance = new Database(); // Executes succesfully

exports.instance = instance;