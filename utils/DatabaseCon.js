const mysql =require('mysql');
let pool;

const getConnection = ()=>{
    return new Promise(async (fulfill,reject)=>{
        console.log('pool');
    
         await pool.getConnection(function(err, conn) {
            if(err) {
                console.log("pool error");
                console.log(err);
                reject(err);
            }
            console.log("pool conn");
                fulfill(conn);
        });
    });   
}

const runQuery = async (query)=>{
    pool =mysql.createPool({
        // connectionLimit : 30000,
        connectionLimit : 1000,
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host     : 'localhost',
        port     :  3306,
        user     : 'grcindia_live',
        password : 'NHc1v7LK!%!]',
        database : 'grcindia_live',
        waitForConnections: true
    });
    
    let connection = pool;

    return new Promise((fulfill,reject)=>{
        connection.query(query,(err, rows, fields)=>{
            // console.log('query',query);            
            if (err) {
                console.log(err);
                // connection.release();
                connection.end();
                reject({status:'error',message:err.sqlMessage,query:query});
            };

            const result_rows = rows
            connection.end();
            // connection.release();
            fulfill(result_rows);
        });
    });
    
}

module.exports= runQuery;



