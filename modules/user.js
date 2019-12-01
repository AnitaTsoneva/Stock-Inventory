
'use strict'

const bcrypt = require('bcrypt-promise')
// const fs = require('fs-extra')
const mime = require('mime-types')
const sqlite = require('sqlite-async')
const saltRounds = 10

module.exports = class User {

	/**
	 * Constructor to create a table users if it doesn't exist.
	 */
	constructor(dbName = ':memory:') {
		return (async() => {

			this.db = await sqlite.open(dbName)
			//const sql2 = 'DROP TABLE users;'
			//await this.db.run(sql2)

			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, department TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Register user.
	 */
	async register(userValues) {
		try {
			console.log(userValues)
			console.log(userValues.user.length)
			if(userValues.user.length === 0) throw new Error('Missing username!')
			if(userValues.pass.length === 0) throw new Error('Missing password!')
			let sql = `SELECT COUNT(id) as records FROM users WHERE user="${userValues.user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${userValues.user}" already in use`)
			userValues.pass = await bcrypt.hash(userValues.pass, saltRounds)
			sql = `INSERT INTO users(user, pass, department) VALUES("${userValues.user}", "${userValues.pass}", "${userValues.department}")`
			await this.db.run(sql);
			return true;
		} catch(err) {
			throw err
		}
	}

	/**
	 * Check if the user's creditions are correct.
	 */
	async login(username, password) {
		try {
			let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
			const records = await this.db.get(sql);
			if(!records.count) throw new Error(`Username "${username}" not found.`)
			sql = `SELECT pass FROM users WHERE user = "${username}";`
			const record = await this.db.get(sql);

			const valid = await bcrypt.compare(password, record.pass);
			if(valid === false) throw new Error(`Wrong password, "${username}"! Please try again.`);
			return true;
		} catch(err) {
			throw err;
		}
	};

	/**
	 * Find the user's department.
	 */
	async user_department(username) {
		try {
			if(username.length === 0) throw new Error('Missing username!')
			let department = [{stock_control:false}, {returns:false}, {till:false}, {adulting_team:false}];
			var sql = `SELECT department FROM users WHERE user = "${username}";`
			const db_response = await this.db.get(sql);	
			switch(db_response.department){case 'stock_control': department[0].stock_control = true; break; case 'returns':department[1].returns = true; break; case 'till': department[2].till = true; break; case 'adulting_team': department[3].adulting_team = true; break;}
			return department;
		} catch(err) {throw err;}
	};

}
