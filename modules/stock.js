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

			const sql_new = 'CREATE TABLE IF NOT EXISTS stock_sales (id INTEGER PRIMARY KEY AUTOINCREMENT, ena_num VAR, quantity_sold INTEGER, product_price INTEGER);'
			await this.db.run(sql_new)
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
        
	};

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
	};
	
	/**
	 *  Checking if item exsist in the dabase and removing it by quantity.
	 * TODO add department of the person removed an item
	*/
	async removeItem(itemValues) {
		
        try {

			// Check if an item exists in stock table 
			let sql = `SELECT COUNT(id) as records FROM stock WHERE ena_num="${itemValues.ena_num}";`
			const data = await this.db.get(sql)

			// Check if an item exists in stock sales table 
			let sql_sales = `SELECT COUNT(id) as records FROM stock_sales WHERE ena_num="${itemValues.ena_num}";`
			//let sql_sales = `DROP TABLE stock_sales;`
			const data_sales = await this.db.get(sql_sales)
			console.log('&&&&&&&&&&&&&&&&&&&&&&&')
			console.log(itemValues)
			console.log(data_sales)
			console.log('&&&&&&&&&&&&&&&&&&&&&&&')

			// Check if item exist
			if(data.records !== 0) {

				let sql = `SELECT quantity, product_price FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const item_specs = await this.db.get(sql);
				let newQuantity = item_specs.quantity - Number(itemValues.quantity);

				if(newQuantity === 0 || newQuantity < 0){
					sql = `DELETE FROM stock WHERE ena_num="${itemValues.ena_num}";`	
				}else{
					sql = `UPDATE stock SET quantity = "${newQuantity}" WHERE ena_num="${itemValues.ena_num}";`		
				}
				await this.db.get(sql)

				// Check if item exists in sales table
				if(data_sales.records !== 0) {

					
					// item doesn't exist in the db
					sql_sales = `SELECT * FROM stock_sales WHERE ena_num="${itemValues.ena_num}";`
					var item_sales_specs = await this.db.get(sql_sales);
					console.log(item_sales_specs)
					let newQuantity_sales = Number(item_sales_specs.quantity) + Number(itemValues.quantity);
					console.log('----- new quantity ------')
					console.log(Number(item_sales_specs.quantity),Number(itemValues.quantity) )
					sql_sales = `UPDATE stock_sales SET quantity_sold = "${newQuantity_sales}" WHERE ena_num="${itemValues.ena_num}";`
					await this.db.get(sql_sales)
				
				
				// Item doesn't exist in sales table
				}else{

					sql_sales = `INSERT INTO stock_sales (ena_num, quantity_sold, product_price) VALUES("${itemValues.ena_num}", "${Number(itemValues.quantity)}", "${item_specs.product_price}");`
					await this.db.get(sql_sales)
				}

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
    async getOverallSales() {

        try {
			let sql = `SELECT * FROM stock_sales;`;
			const data = await this.db.all(sql)
			//if(data.records !== 0) throw new Error(`Item Name "${ena_num}" already exists`)
			console.log('------ STOCK SALES ---------')
			console.log(data)
			//sql = `INSERT INTO stock(ena_num, quantity) VALUES("${ena_num}", "${quantity}")`
			//await this.db.run(sql)
			return data;
		} catch(err) {
            console.log(err)
			throw err
        }
	}
   

}