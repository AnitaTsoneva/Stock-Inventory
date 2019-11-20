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


    async add(itemName, quantity) {

        try {
			if(itemName.length === 0) throw new Error('Missing item name')
            if(quantity === 0) throw new Error('Missing quantity')
            
            let sql2 = `SELECT * FROM stock;`
            const data2 = await this.db.get(sql2)
            console.log('+++++++++++++++++');

            console.log(data2);
            console.log('+++++++++++++++++');



			let sql = `SELECT COUNT(id) as records FROM stock WHERE itemName="${itemName}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`Item Name "${itemName}" already exists`)
            
            
            //pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO stock(itemName, quantity) VALUES("${itemName}", "${quantity}")`
			await this.db.run(sql)
			return true
		} catch(err) {
            console.log(err)
			throw err
        }
        
    }
    

}