'use strict'

const sqlite = require('sqlite-async');

module.exports = class Stock {

    constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName);
			const sql = 'CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY AUTOINCREMENT, ena_num VAR, item_name TEXT, quantity INTEGER, product_price INTEGER, quantity_sold INTEGER);'
			await this.db.run(sql); return this;
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
			if(itemValues.ena_num === 0 || itemValues.ena_num === '') throw new Error('Missing barcode number!');
			if(itemValues.item_name === 0 || itemValues.item_name === '') throw new Error('Missing item name!');
			if(itemValues.quantity === 0 || itemValues.quantity === '') throw new Error('Missing item quantity!');
			if(itemValues.product_price === 0 || itemValues.product_price === '') throw new Error('Missing item product price!');

			// Check if item exist
			if(data.records !== 0) {
				let sql = `SELECT quantity FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const existingQuantity = await this.db.get(sql)
				let newQuantity = Number(itemValues.quantity) + existingQuantity.quantity;

				sql = `UPDATE stock SET quantity = "${newQuantity}" WHERE ena_num="${itemValues.ena_num}";`
				await this.db.get(sql)
				return true;

			}else{
				sql = `INSERT INTO stock(ena_num, item_name, quantity, product_price, quantity_sold) VALUES("${itemValues.ena_num}", "${itemValues.item_name}", "${itemValues.quantity}", "${itemValues.product_price}", "0")`
				await this.db.run(sql); return true;
			}				
		} catch(err) { throw err} 
	};

	/**
	 *  Retrieveing all items in the database
	*/
    async getAllItems() {
        try {
			let sql = `SELECT * FROM stock;`;
			const response = {}
			response.status = true;
			response.data = await this.db.all(sql);

			return response;
		} catch(err) {throw err;}
	};
	
	/**
	 *  Checking if item exsist in the dabase and removing it by quantity.
	 * 	TODO add department of the person removed an item
	*/
	async removeItem(itemValues) {
        try {

			// Check if an item exists in stock table 
			const data = await this.db.get(`SELECT COUNT(id) as records FROM stock WHERE ena_num="${itemValues.ena_num}";`);
			if(itemValues.ena_num === 0 || itemValues.ena_num === '') throw new Error('Missing barcode number!');
			if(itemValues.quantity === 0 || itemValues.quantity === '') throw new Error('Missing quantity!');

			// Check if item exist
			if(data.records !== 0) {

				let sql = `SELECT quantity, product_price FROM stock WHERE ena_num="${itemValues.ena_num}";`
				const item_specs = await this.db.get(sql);
				let newQuantity = item_specs.quantity - Number(itemValues.quantity);

				if(newQuantity === 0 || newQuantity < 0) await this.db.get(`UPDATE stock SET quantity = "0", quantity_sold = "${item_specs.quantity}"  WHERE ena_num="${itemValues.ena_num}";`);
				else await this.db.get(`UPDATE stock SET quantity = "${newQuantity}", quantity_sold = "${Number(itemValues.quantity)}"  WHERE ena_num="${itemValues.ena_num}";`)
				return true;

			}else return false;			
		}catch(err) {throw err;}
	};

	/**
	 *  Retrieveing all sold items and calculating the overall sales
	*/
    async getOverallSales() {
        try {
			const number_of_items = await this.db.get(`SELECT COUNT(id) as records FROM stock;`);
			const data = await this.db.all(`SELECT * FROM stock;`);
			let overallSales = 0;

			// Multiply the price by the quantity
			for(var i=0; i < number_of_items.records; i++) overallSales = overallSales + (data[i].quantity_sold*data[i].product_price);
			return overallSales;

		}catch(err) {throw err}
	};
}