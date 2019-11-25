'use strict'

const sqlite = require('sqlite-async');


module.exports = class Stock {

    constructor(dbName = ':memory:') {
		return (async() => {
			
			this.db = await sqlite.open(dbName)

			//const sql1 = 'DROP TABLE stock ;'
			//await this.db.run(sql1);
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY AUTOINCREMENT, ena_num VAR, item_name TEXT, quantity INTEGER, product_price INTEGER);'
			await this.db.run(sql)
			return this
		})()
	}


	/**
	 *  Checking if item exsist in the dabase, if not addimg more.
	 *  Increasing the quantity of items if they already exist.
	*/
    async addItem(itemValues) {

        try {
			let sql = `SELECT COUNT(id) as records FROM stock WHERE ena_num="${itemValues.ena_num}";`
			const data = await this.db.get(sql)

			// Check if item exist
			if(data.records !== 0) {
				let sql = `SELECT quantity FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const existingQuantity = await this.db.get(sql)
				let newQuantity = Number(itemValues.quantity) + existingQuantity.quantity;

				sql = `UPDATE stock SET quantity = "${newQuantity}" WHERE ena_num="${itemValues.ena_num}";`
				await this.db.get(sql)
				return true

			}else{
				sql = `INSERT INTO stock(ena_num, item_name, quantity, product_price) VALUES("${itemValues.ena_num}", "${itemValues.item_name}", "${itemValues.quantity}", "${itemValues.product_price}")`
				await this.db.run(sql)
				return true
			}
						
		} catch(err) {
            console.log(err)
			throw err
        }
        
	}
	
	/**
	 *  Checking if item exsist in the dabase and removing it by quantity.
	*/
	async removeItem(itemValues) {
		
        try {
			let sql = `SELECT COUNT(id) as records FROM stock WHERE ena_num="${itemValues.ena_num}";`
			const data = await this.db.get(sql)

			// Check if item exist
			if(data.records !== 0) {
				let sql = `SELECT quantity FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const existingQuantity = await this.db.get(sql)
				let newQuantity = existingQuantity.quantity - Number(itemValues.quantity);

				sql = `UPDATE stock SET quantity = "${newQuantity}" WHERE ena_num="${itemValues.ena_num}";`
				await this.db.get(sql)
				return true

			}else{
				// item doesnt exist
				return true
			}
						
		} catch(err) {
            console.log(err)
			throw err
        }
	}

	/**
	 *  Retrieveing all items in the database
	*/
    async getAllItems() {

        try {
			let sql = `SELECT * FROM stock;`;
			const data = await this.db.all(sql)
			//if(data.records !== 0) throw new Error(`Item Name "${ena_num}" already exists`)

			//sql = `INSERT INTO stock(ena_num, quantity) VALUES("${ena_num}", "${quantity}")`
			//await this.db.run(sql)
			return data;
		} catch(err) {
            console.log(err)
			throw err
        }
	}
   

}