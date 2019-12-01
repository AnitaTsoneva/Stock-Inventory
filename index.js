#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})
const session = require('koa-session')
const hbs = require('koa-hbs');

//const jimp = require('jimp')

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')
const Stock = require('./modules/stock')

const app = new Koa()
const router = new Router()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

const defaultPort = 8080
const port = process.env.PORT || defaultPort
const dbName = 'website.db'

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */
router.get('/', async ctx => {
	try {
		if(ctx.session.authorised !== true) return ctx.redirect('/login?msg=you need to log in')
		const data = {}
		if(ctx.query.msg) data.msg = ctx.query.msg
		await ctx.render('index')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
});

/**
 * The user permissions page.
 *
 * @name View_permissions Page
 * @route {GET} /view_permissions
 */
router.get('/view_permissions', async ctx => {

	try {
		await ctx.render('permissions')
	} catch(err) {
		ctx.body = err.message
	}
});


/**
 * The script to process new user registrations.
 *
 * @name Stock Script
 * @route {POST} /stock
 */
router.post('/stock', koaBody, async ctx => {
	try {
		const body = ctx.request.body;
		const stock = await new Stock(dbName);
		await stock.addItem(body);
		const response = await stock.getAllItems();
		await ctx.render('index', response.data);

	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
}); 


/**
 * The script to process new user registrations.
 *
 * @name Stock_remove Script
 * @route {POST} /stock_remove
 */
router.post('/stock_remove', koaBody, async ctx => {
	try {
		const body = ctx.request.body;
		const stock = await new Stock(dbName)
		await stock.removeItem(body);

	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
});

router.post('/stock_add', koaBody, async ctx => {
	try {
		const body = ctx.request.body;
		const stock = await new Stock(dbName)
		await stock.addItem(body)
		await stock.getAllItems();

		ctx.redirect(`/?msg=new item "${body.item}" added`)

	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
});


/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'));

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 * @param {string} user - The user's name.
 * @param {string} pass - The user's password.
 * @param {string} department - The user's department.
 * 
 */
router.post('/register', koaBody, async ctx => {
	try {
		const body = ctx.request.body;
		const user = await new User(dbName);
		await user.register(body);
		ctx.redirect(`/?msg=new user "${body.name}" added`);
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
});

/**
 * The script to process user login.
 *
 * @name Login Script
 * @route {GET} /login
 * @param {string} department - The user's department.
 * 
 */
router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg) data.msg = ctx.query.msg
	if(ctx.query.user) data.user = ctx.query.user
	await ctx.render('login', data)
});

/**
 * The script to process new user registrations.
 *
 * @name Login Script
 * @route {POST} /login
 * @param {string} user - The user's name.
 * @param {string} pass - The user's password.
 * @param {string} department - The user's department.
 * 
 */
router.post('/login', async ctx => {
	try {
		const body = ctx.request.body;
		const user = await new User(dbName);
		const stock = await new Stock(dbName);
		await user.login(body.user, body.pass);

		var department = await user.user_department(body.user);
		ctx.session.authorised = true;
	
		const overall_sales = await stock.getOverallSales();
		const items = await stock.getAllItems();
	
		await ctx.render('index', {username: body.user, department:department, items: items.data, overall_sales:overall_sales})
		//return ctx.redirect('/?msg=you are now logged in...')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
});

router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.redirect('/?msg=you are now logged out')
});

app.use(router.routes())

const server = app.listen(port, async() => console.log(`Listening on port.. ${port}`));
module.exports = server;
