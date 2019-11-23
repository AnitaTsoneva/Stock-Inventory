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
})

/**
 * The stock page.
 *
 * @name Stock Page
 * @route {GET} /stock
 */
router.get('/stock', async ctx => await ctx.render('getAllItems')) 

/**
 * The script to process new user registrations.
 *
 * @name Stock Script
 * @route {POST} /stock
 */
router.post('/stock', koaBody, async ctx => {
	try {

		const body = ctx.request.body;

		const stock = await new Stock(dbName)
		await stock.addItem(body)

		var response = await stock.getAllItems();
		console.log('+++++++++++++++++++++');

		console.log(response)
		console.log('+++++++++++++++++++++');
		await ctx.render('index', {ena_num: response.ena_num, itemName:response.itemName, quantity:response.quantity})
		// redirect to the home page
		//ctx.redirect(`/?msg=new item "${body.item}" added`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
}) 
/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		
		console.log(body)
		console.log('---------');
		// call the functions in the module
		const user = await new User(dbName)
		await user.register(body)
		// await user.uploadPicture(path, type)
		// redirect to the home page
		ctx.redirect(`/?msg=new user "${body.name}" added`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg) data.msg = ctx.query.msg
	if(ctx.query.user) data.user = ctx.query.user
	await ctx.render('login', data)
})

router.post('/login', async ctx => {
	try {
		const body = ctx.request.body;
		const user = await new User(dbName);
		await user.login(body.user, body.pass);
		ctx.session.authorised = true;
		
		var myData = { username: body.user};

		//await ctx.render('index', {title: 'Favourite Books'})

		//console.log(data)
		await ctx.render('index', {title: myData.username})
		//return ctx.redirect('/?msg=you are now logged in...')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.redirect('/?msg=you are now logged out')
})

app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
