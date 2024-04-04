'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../sql/models/index').sequelize;
const sql = require('../sql/models/index');

var crypto = require('crypto');
const users = require('../sql/models/users');
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
