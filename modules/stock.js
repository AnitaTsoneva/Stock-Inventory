'use strict'

const sqlite = require('sqlite-async');


module.exports = class Stock {

    constructor(dbName = ':memory:') {
		return (async() => {
			
			this.db = await sqlite.open(dbName);
			const sql = 'CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY AUTOINCREMENT, ena_num VAR, item_name TEXT, quantity INTEGER, product_price INTEGER, quantity_sold INTEGER);'
			await this.db.run(sql);

			return this;
		})()
	};

	/**
	 *  Checking if item exsist in the dabase, if not addimg more.
	 *  Increasing the quantity of items if they already exist.
	*/
    async addItem(itemValues){

        try {
			let sql = `SELECT COUNT(id) as records FROM stock WHERE ena_num="${itemValues.ena_num}";`
			const data = await this.db.get(sql);

			// Check if item exist
			if(data.records !== 0) {
				let sql = `SELECT quantity FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const existingQuantity = await this.db.get(sql)
				let newQuantity = Number(itemValues.quantity) + existingQuantity.quantity;

				sql = `UPDATE stock SET quantity = "${newQuantity}" WHERE ena_num="${itemValues.ena_num}";`
				await this.db.get(sql)
				return true

			}else{
				sql = `INSERT INTO stock(ena_num, item_name, quantity, product_price, quantity_sold) VALUES("${itemValues.ena_num}", "${itemValues.item_name}", "${itemValues.quantity}", "${itemValues.product_price}", "0")`
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
			const data = await this.db.all(sql);
			
			//await this.db.run(sql)
			return data;
		} catch(err) {
            console.log(err)
			throw err
        }
	};
	
	/**
	 *  Checking if item exsist in the dabase and removing it by quantity.
	 * 	TODO add department of the person removed an item
	*/
	async removeItem(itemValues) {
		
        try {

			// Check if an item exists in stock table 
			let sql = `SELECT COUNT(id) as records FROM stock WHERE ena_num="${itemValues.ena_num}";`
			const data = await this.db.get(sql);

			// Check if item exist
			if(data.records !== 0) {

				let sql = `SELECT quantity, product_price FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const item_specs = await this.db.get(sql);
				let newQuantity = item_specs.quantity - Number(itemValues.quantity);

				if(newQuantity === 0 || newQuantity < 0){
					sql = `UPDATE stock SET quantity = "0", quantity_sold = "${item_specs.quantity}"  WHERE ena_num="${itemValues.ena_num}";`
				}else{
					sql = `UPDATE stock SET quantity = "${newQuantity}", quantity_sold = "${Number(itemValues.quantity)}"  WHERE ena_num="${itemValues.ena_num}";`		
				}
				await this.db.get(sql);
				return true;

			}else{
				// item doesnt exist
				return true;
			}
						
		} catch(err) {
            console.log(err)
			throw err;
        }
	};

	/**
	 *  Retrieveing all sold items and calculating the overall sales
	*/
    async getOverallSales() {

        try {
			
			let sql_sales = `SELECT COUNT(id) as records FROM stock;`
			const number_of_items = await this.db.get(sql_sales);
			
			let sql = `SELECT * FROM stock;`;
			const data = await this.db.all(sql);

			let overallSales = 0;

			// Multiply the price by the quantity
			for(var i=0; i < number_of_items.records; i++){
				overallSales = overallSales + (data[i].quantity_sold*data[i].product_price);
			}

			return overallSales;

		} catch(err) {
            console.log(err)
			throw err
        }
	};
   
}