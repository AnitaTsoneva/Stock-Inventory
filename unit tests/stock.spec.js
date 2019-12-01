'use strict'

const Stock = require('../modules/stock.js')

describe('Add items', () => {

    test('Add a new item', async done => {
		expect.assertions(1)
		const stock = await new Stock()
		const item_added = await stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: 3, product_price: 30.8, quantity_sold:0 })
		expect(item_added.status).toBe(true)
		done()
    });

    test('Add an existing valid item (including all parameters)', async done => {
		expect.assertions(1)
		const stock = await new Stock()
        await stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: 3, product_price: 30.8, quantity_sold:0 })
        const item_added = await stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: 1, product_price: 30.8, quantity_sold:0 })
		expect(item_added.status).toBe(true)
		done()
    });
    
    test("Blank item's barcode number", async done => {
		expect.assertions(1)
        const stock = await new Stock()
		await expect( stock.addItem({ena_num:'', item_name:'Motherboard', quantity: 3, product_price: 30.8, quantity_sold:0 }) )
			.rejects.toEqual( Error('Missing barcode number!') )
		done()
    });
    
    test("Blank item's name", async done => {
		expect.assertions(1)
        const stock = await new Stock()
		await expect( stock.addItem({ena_num:2897, item_name:'', quantity: 3, product_price: 30.8, quantity_sold:0 }) )
			.rejects.toEqual( Error('Missing item name!') )
		done()
    });
    
    test("Blank item's quantity", async done => {
		expect.assertions(1)
        const stock = await new Stock()
		await expect( stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: '', product_price: 30.8, quantity_sold:0 }) )
			.rejects.toEqual( Error('Missing item quantity!') )
		done()
    });
    
    test("Blank item's product price", async done => {
		expect.assertions(1)
        const stock = await new Stock()
		await expect( stock.addItem({ena_num:2897, item_name:'Motherboard', quantity:2, product_price: '', quantity_sold:0 }) )
			.rejects.toEqual( Error('Missing item product price!') )
		done()
    });
});

describe('Retrieve items', () => {

    test('Retrieve all items', async done => {
		expect.assertions(1)
		const stock = await new Stock()
        await stock.getAllItems()
        const item_in_db = await stock.getAllItems()
		expect(item_in_db.status).toBe(true)
		done()
    });
});    

describe('Remove items', () => {

    test('Remove item when existing', async done => {
		expect.assertions(1)
        const stock = await new Stock()
        await stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: 8, product_price: 30.8, quantity_sold:0 })
		const item_removed = await stock.removeItem({ena_num:2897, quantity: 3})
		expect(item_removed.status).toBe(true)
		done()
    });

    test('Error if remove not existing item', async done => {
		expect.assertions(1)
        const stock = await new Stock()
		const item_removed = await stock.removeItem({ena_num:2197, quantity: 2})
		expect(item_removed.status).toBe(false)
		done()
    });

    test("Blank item's barcode when removing", async done => {
		expect.assertions(1)
        const stock = await new Stock()
        await stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: 8, product_price: 30.8, quantity_sold:0 })
		await expect( stock.removeItem({ena_num:'', quantity: 3}) )
			.rejects.toEqual( Error('Missing barcode number!') )
		done()
    });

    test("Blank item's quantity when removing", async done => {
		expect.assertions(1)
        const stock = await new Stock()
        await stock.addItem({ena_num:2897, item_name:'Motherboard', quantity: 8, product_price: 30.8, quantity_sold:0 })
		await expect( stock.removeItem({ena_num:2897, quantity: ''}) )
			.rejects.toEqual( Error('Missing quantity!') )
		done()
    });
})