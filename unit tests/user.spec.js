'use strict'

const Accounts = require('../modules/user.js')

describe('register()', () => {

	test('Register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		expect(register).toBe(true)
		done()
	});

	test('Register a duplicate username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		await expect( account.register({user:'doej', pass:'password', department: 'adulting_team'}) )
			.rejects.toEqual( Error('username "doej" already in use') )
		done()
	});

	test('Error if blank username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register({user:'', pass:'password', department: 'adulting_team'}) )
			.rejects.toEqual( Error('Missing username!') )
		done()
	});

	test('Error if blank password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register({user:'doej', pass:'', department: 'adulting_team'}) )
			.rejects.toEqual( Error('Missing password!') )
		done()
	});

});

describe('Test login', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		const valid = await account.login('doej', 'password')
		expect(valid).toBe(true)
		done()
	});

	test('Invalid username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		await expect( account.login('roej', 'password') )
			.rejects.toEqual( Error('Username "roej" not found.' ))
		done()
	});

	test('Invalid password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		await expect( account.login('doej', 'bad') )
			.rejects.toEqual( Error('Wrong password, "doej"! Please try again.') )
		done()
	});

	test('Check for corect user department', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		
		const valid = await account.user_department('doej')
		expect(valid).toStrictEqual([{stock_control:false}, {returns:false}, {till:false}, {adulting_team:true}])
		done()
	});

	test('Check for corect user department', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		
		const valid = await account.user_department('doej')
		expect(valid).toStrictEqual([{stock_control:false}, {returns:false}, {till:false}, {adulting_team:true}])
		done()
	});

	test('Missing username when trying to check department', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register({user:'doej', pass:'password', department: 'adulting_team'})
		
		await expect( account.user_department('') )
			.rejects.toEqual( Error('Missing username!') )
		done()
	});

});