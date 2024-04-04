'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../db/models/index').sequelize;
const sql = require('../db/models/index');

var crypto = require('crypto');
const users = require('../db/models/users');
const { hashpass } = require('./utils');

exports.login = (req, res) => {
    (async () => {

        console.log("GET USER LOGIN");


    })().catch(console.error);
};

exports.register = (req, res) => {
    (async () => {

        console.log("REGISTER USER");


    })().catch(console.error);
};
