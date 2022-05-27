process.env.NODE_ENV = 'test'
const app = require('./app')
const supertest = require('supertest')
const db = require('./db')


// let testInvoice;
// let testCompany;

// beforeEach(async ()=>{
//     const company = await db.query(`INSERT INTO companies (code, name, description) VALUES ('ibm', 'IBM', 'Big Blue') 
//     RETURNING code, name, description`)
//     testCompany = company.rows[0]
//     const invoice = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES (ibm, 500, false, 2022-02-26) 
//     RETURNING *`)
//     testInvoice = invoice.rows[0]
// })

// afterEach(async ()=>{
//     await db.query(`DELETE FROM invoices`)
// })

afterAll(async()=>{
    await db.end()
})


// describe('GET /invoices', ()=>{
//     test('testing invoices data', async()=>{
//         const result = await supertest(app).get('/invoices')
//         expect(result.statusCode).toBe(200)
//         expect(result.rows[0]).toEqual(testInvoice)
//     })
// })


describe('testing', ()=>{
    test('/', ()=>{
        let greet = 'hello'
        expect('hello').toEqual('hello')
    })
})