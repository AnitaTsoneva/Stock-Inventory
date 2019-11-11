'use strict'

/* MODULE IMPORTS */
const Koa = require('koa');
const Router = require('koa-router');

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user');

const app = new Koa();
const router = new Router();