process.env.NODE_ENV = 'test'
const supertest = require('supertest')
const app = require('./app')
const db = require('./db')


let testCompanies;
let testCompany;
let testInvoice;
let testInvoiceData;

beforeEach( async()=> {
    const comp_result = await db.query(`INSERT INTO companies (code, name, description) 
                                    VALUES ('ibm', 'IBM', 'Big Blue') 
                                    RETURNING code, name, description`);

    testCompanies = {"companies": comp_result.rows};
    
    const invoice_result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
                                    VALUES ('ibm', 500, false, '2022-02-26', null) 
                                    RETURNING id, comp_code, amt, paid, add_date, paid_date`);

    let data = comp_result.rows[0];
    testCompany = {"company": {"code": data.code, "name": data.name, 
                    "description": data.description, "invoices": invoice_result.rows}}

    const invoice_data = invoice_result.rows[0]
    const invoice = {
        "id": invoice_data.id,
        "comp_code": invoice_data.comp_code,
        "amt": invoice_data.amt,
        "paid": invoice_data.paid,
        "add_date": invoice_data.add_date,
        "paid_date": invoice_data.paid_date,
        "company": {
            "code": data.code,
            "name": data.name,
            "description": data.description
        }
    }
    testInvoice = {"invoice": invoice}
    testInvoiceData = invoice_data
});

afterEach(async ()=>{
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
});

afterAll(async()=>{
    await db.end()
});


describe('GET /companies', ()=>{
    test('testing companies data', async()=>{
        const result = await supertest(app).get('/companies')
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual(testCompanies)
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/wrong')
        expect(result.statusCode).toBe(404)
    })
})


describe('GET /companies/:code', ()=>{
    test('testing a company data', async()=>{
        const result = await supertest(app).get('/companies/ibm')
        expect(result.statusCode).toBe(200)
        expect(JSON.stringify(result.body)).toEqual(JSON.stringify(testCompany))
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/companies/wrong')
        expect(result.statusCode).toBe(404)
    })
})


describe('POST /companies', ()=>{
    test('creating a company data', async()=>{
        const result = await supertest(app).post('/companies').send({code:'apple', name:'APPLE', 
                                                                    description: 'IOS OS creater'})
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({company: {code:'apple', name:'APPLE', description: 'IOS OS creater'}})
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/wrong')
        expect(result.statusCode).toBe(404)
    })
})


describe('PATCH /companies/:code', ()=>{
    test('updating a company data', async()=>{
        const result = await supertest(app).patch('/companies/ibm').send({code:'ibm', name:'IBM', 
                                                                    description: 'Hardware and Software creater'})
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({company: {code:'ibm', name:'IBM', description: 'Hardware and Software creater'}})
    })
    test('testing 404', async()=>{
        const result = await supertest(app).patch('/companies/wrong')
        expect(result.statusCode).toBe(404)
    })
})

describe('DELETE /companies/:code', ()=>{
    test('deleting a company data', async()=>{
        const result = await supertest(app).delete(`/companies/ibm`)
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({status: "Deleted"})
    })
})



// ********************************
// testing invoices


describe('GET /invoices/id', ()=>{
    test('testing an invoice data', async()=>{
        const result = await supertest(app).get(`/invoices/${testInvoice.invoice.id}`)
        expect(result.statusCode).toBe(200)
        expect(JSON.stringify(result.body)).toEqual(JSON.stringify(testInvoice))
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/invoices/0')
        expect(result.statusCode).toBe(404)
    })
})

describe('POST /invoices', ()=>{
    test('creating an invoice data', async()=>{
        const result = await supertest(app).post('/invoices').send({comp_code:'ibm', amt:1000, paid: true, 
                                                                    add_date: '2022-05-28T07:00:00.000Z', paid_date: '2022-05-28T07:00:00.000Z'})
        expect(result.statusCode).toBe(201)
        expect(result.body).toEqual({invoice: {id: expect.any(Number), comp_code:'ibm', amt:1000, paid: true, 
                                                add_date: '2022-05-28T07:00:00.000Z', paid_date: '2022-05-28T07:00:00.000Z'}})
    })
    test('testing 404', async()=>{
        const result = await supertest(app).post('/wrong')
        expect(result.statusCode).toBe(404)
    })
})

describe('PATCH /invoices/id', ()=>{
    test('creating an invoice data', async()=>{
        const result = await supertest(app).patch(`/invoices/${testInvoice.invoice.id}`).send({
            comp_code:'ibm', amt:10, paid: true, 
            add_date: '2022-05-28T07:00:00.000Z', 
            paid_date: '2022-05-28T07:00:00.000Z'})

        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({invoice: {id: expect.any(Number), comp_code:'ibm', amt:10, paid: true, 
                                                add_date: '2022-05-28T07:00:00.000Z', 
                                                paid_date: '2022-05-28T07:00:00.000Z'}})
    })
    test('testing 404', async()=>{
        const result = await supertest(app).patch('/invoices/0')
        expect(result.statusCode).toBe(404)
    })
})

describe('DELETE /invoices/id', ()=>{
    test('Deleting an invoice data', async()=>{
        const result = await supertest(app).delete(`/invoices/${testInvoice.invoice.id}`)
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({status: "Deleted"})
    })
})




