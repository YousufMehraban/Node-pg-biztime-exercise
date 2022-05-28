const express = require('express')
const router = new express.Router()
const slugify = require('slugify')

const db = require('../db')
const ExpressError = require('../expressError')


router.get('/', async(req, res, next)=>{
    try{
        const result = await db.query(`SELECT * FROM companies`)
        return res.json({companies: result.rows})
    } catch(e){
        return next(e)
    }

})


router.get('/:code', async(req, res, next)=>{
    try{
        const code = req.params.code
        const comp_result = await db.query(`SELECT * FROM companies WHERE code=$1`, [code])
        const invoice_result = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code])
        const industry_result = await db.query(`SELECT i.code, i.industry FROM industries as i LEFT JOIN 
                                                industries_companies as ic ON i.code = ic.ind_code 
                                                WHERE ic.comp_code = $1`, [code])

        if (comp_result.rows.length === 0){
            throw new ExpressError('Company Not Found', 404)
        }
        let comp_data = comp_result.rows[0]
        let data = {'company': {'code': comp_data.code, 'name': comp_data.name, 'description': comp_data.description, 
                                'invoices': invoice_result.rows, 'industries': industry_result.rows}}

        return res.json(data)
    } catch(e){
        return next(e)
    }
})

router.post('/', async(req, res, next)=>{
    try{
        const name = req.body.name
        const description = req.body.description
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) 
                                        RETURNING code, name, description`, [slugify(name, {lower:true}), name, description])
        return res.json({company: result.rows[0]})
    } catch(e){
        return next(e)
    }

})

router.patch('/:code', async(req, res, next)=>{
    try{
        const id = req.params.code
        const code = req.body.code
        const name = req.body.name
        const description = req.body.description
        const result = await db.query(`UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4
                                        RETURNING code, name, description`, [code, name, description, id])
        if (result.rows.length === 0){
            throw new ExpressError('No Such Company Found to Be Updated', 404)
        }
        return res.json({company: result.rows[0]})
    } catch(e){
        return next(e)
    }
})


router.delete('/:code', async(req, res, next)=>{
    try{
        await db.query(`DELETE FROM companies WHERE code=$1`, [req.params.code])
        return res.json({status: "Deleted"})
    } catch(e){
        return next(e)
    }
})



module.exports = router
