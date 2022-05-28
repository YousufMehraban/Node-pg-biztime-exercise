process.env.NODE_ENV = 'test'
const supertest = require('supertest')
const app = require('./app')
const db = require('./db')


let testCompanies;
let testCompany;
let testInvoice;

beforeEach( async()=> {
    const comp_result = await db.query(`INSERT INTO companies (code, name, description) 
                                    VALUES ('ibm', 'IBM', 'Big Blue') 
                                    RETURNING code, name, description`);

    testCompanies = {"companies": comp_result.rows};
    
    const invoice_result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
                                    VALUES ('ibm', 500, false, '2022-02-26', null) 
                                    RETURNING id, comp_code, amt, paid, add_date, paid_date`);

    let data = comp_result.rows[0];
    testCompany = {"company": {"code": data.code, "name": data.name, "description": data.description, "invoices": invoice_result.rows}}

    const invoice_data = invoice_result.rows[0]
    const invoice = {
        "id": invoice_data.id,
        "comp_code": invoice_data.comp_code,
        "amt": invoice_data.amt,
        "paid": invoice_data.paid,
        "add_date": invoice_data.add_date,
        "paid_date": invoice_data.paid_date,
        "company": {
            "code": invoice_data.code,
            "name": invoice_data.name,
            "description": invoice_data.description
        }
    }
    testInvoice = {"invoice": invoice}
});

afterEach(async ()=>{
    await db.query(`DELETE FROM companies`)
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


describe('GET /companies/id', ()=>{
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
    test('testing a company data', async()=>{
        const result = await supertest(app).get('/companies')
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual(testCompanies)
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/wrong')
        expect(result.statusCode).toBe(404)
    })
})


describe('PATCH /companies/id', ()=>{
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

describe('DELETE /companies/id', ()=>{
    test('testing a company data', async()=>{
        const result = await supertest(app).get('/companies/ibm')
        expect(result.statusCode).toBe(200)
        expect(JSON.stringify(result.body)).toEqual(JSON.stringify(testCompany))
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/wrong')
        expect(result.statusCode).toBe(404)
    })
})



// ********************************
// testing invoices


describe('GET /invoices/id', ()=>{
    test('testing a invoice data', async()=>{
        const result = await supertest(app).get('/invoices/1')
        expect(result.statusCode).toBe(200)
        // console.log(result.body)
        // console.log(testCompany)
        expect(result.body).toEqual(testInvoice)
    })
    test('testing 404', async()=>{
        const result = await supertest(app).get('/invoices/wrong')
        expect(result.statusCode).toBe(404)
    })
})