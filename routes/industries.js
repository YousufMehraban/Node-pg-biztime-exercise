const express = require('express')
const router = new express.Router()
const slugify = require('slugify')

const db = require('../db')
const ExpressError = require('../expressError')


router.get('/', async(req, res, next)=>{
    try{
        const result = await db.query(`SELECT i.code, i.industry, ic.comp_code FROM industries as i LEFT JOIN
                                        industries_companies as ic ON i.code = ic.ind_code`)
        
        if (result.rows.length === 0){
            throw new ExpressError('No industry found', 404)
        }                                
        return res.json({industries: result.rows})

    } catch(e){
        return next(e)
    }
})

router.post('/', async(req, res, next)=>{
    try{
        const {code, industry} = req.body
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
                                     [code, industry])
        if (result.rows.length === 0){
            throw new ExpressError('No industry found', 404)
        }
        return res.json({industry: result.rows[0]})
    } catch(e){
        return next(e)
    }
})

router.post('/companies', async(req, res, next)=>{
    try{
        const {ind_code, comp_code} = req.body
        const result = await db.query(`INSERT INTO industries_companies (ind_code, comp_code) VALUES ($1, $2)
                                        RETURNING ind_code, comp_code`,[ind_code, comp_code]);

        if (result.rows.length === 0){
            throw new ExpressError('No industry found', 404)
        }
        return res.json({industriesCompanies: result.rows[0]})
    } catch(e){
        return next(e)
    }
})



module.exports = router
