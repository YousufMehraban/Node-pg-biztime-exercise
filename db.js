/** Database setup for BizTime. */

const {Client} = require('pg')


let URI;

if (process.env.NODE_ENV === 'test'){
    URI = 'postgresql:///usersdb_test'
} else{
    URI = 'postgresql:///biztime'
}

const db = new Client({connectionString:URI})
db.connect()



module.exports = db
