'use strict'

const sqlite = require('sqlite-async');


module.exports = class Stock {

    constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY AUTOINCREMENT, itemName TEXT, quantity VAR);'
			await this.db.run(sql)
			return this
		})()
	}


	/**
	 * 
	 *  Checking if items exsist in the dabase, if not addimg more.
	 *  TODO add option instead of adding new item to increase the quantity
	*/
    async addItem(itemName, quantity) {

        try {
			let sql = `SELECT COUNT(id) as records FROM stock WHERE itemName="${itemName}";`
			const data = await this.db.get(sql)
			//if(data.records !== 0) throw new Error(`Item Name "${itemName}" already exists`)
			sql = `INSERT INTO stock(itemName, quantity) VALUES("${itemName}", "${quantity}")`
			await this.db.run(sql)
			return true
		} catch(err) {
            console.log(err)
			throw err
        }
        
    }

    async getAllItems() {

        try {
			let sql = `SELECT * FROM stock;`;
			const data = await this.db.all(sql)
			//if(data.records !== 0) throw new Error(`Item Name "${itemName}" already exists`)
			console.log('++++++++00+++++++++');

			console.log(data);
			console.log('++++++++00+++++++++');
            //pass = await bcrypt.hash(pass, saltRounds)
			//sql = `INSERT INTO stock(itemName, quantity) VALUES("${itemName}", "${quantity}")`
			//await this.db.run(sql)
			return data;
		} catch(err) {
            console.log(err)
			throw err
        }
	}
	
	async getItemBy() {

        // TODO 
    }

    

}