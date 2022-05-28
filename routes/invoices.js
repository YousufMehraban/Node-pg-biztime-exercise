const express = require('express')
const router = new express.Router()

const db = require('../db')
const ExpressError = require('../expressError')

router.get('/', async(req, res, next)=>{
    try{
        const result = await db.query(`SELECT * FROM invoices`)
        return res.json({invoices: result.rows})
    } catch(e){
        return next(e)
    }

})


router.get('/:id', async(req, res, next)=>{
    try{
        const result = await db.query(`SELECT * FROM invoices JOIN companies ON invoices.comp_code=companies.code
                                                 WHERE invoices.id=$1`, [req.params.id]);
        if (result.rows.length === 0){
            throw new ExpressError('Invoice Not Found', 404)
        }
        const data = result.rows[0]
        const invoice = {
            "id": data.id,
            "comp_code": data.comp_code,
            "amt": data.amt,
            "paid": data.paid,
            "add_date": data.add_date,
            "paid_date": data.paid_date,
            "company": {
                "code": data.code,
                "name": data.name,
                "description": data.description
            }
        }
        return res.json({"invoice": invoice})
    } catch(e){
        return next(e)
    }
})

router.post('/', async(req, res, next)=>{
    try{
        const comp_code = req.body.comp_code
        const amt = req.body.amt
        const paid = req.body.paid
        const add_date = req.body.add_date
        const paid_date = req.body.paid_date

        const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5) 
                                        RETURNING *`, [comp_code, amt, paid, add_date, paid_date])
        return res.status(201).json({invoice: result.rows[0]})
    } catch(e){
        return next(e)
    }

})

router.patch('/:id', async(req, res, next)=>{
    try{
        const id = req.params.id
        const comp_code = req.body.comp_code
        const amt = req.body.amt
        const paid = req.body.paid
        const add_date = req.body.add_date
        const paid_date = req.body.paid_date

        const result = await db.query(`UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5
                                         WHERE id=$6 RETURNING *`, [comp_code, amt, paid, add_date, paid_date, id])
        if (result.rows.length === 0){
            throw new ExpressError('Invoice Not Found to Be Updated', 404)
        }
        return res.json({invoice: result.rows[0]})
    } catch(e){
        return next(e)
    }
})


router.delete('/:id', async(req, res, next)=>{
    try{
        await db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id])
        return res.json({status: "Deleted"})
    } catch(e){
        return next(e)
    }
})







module.exports = router
