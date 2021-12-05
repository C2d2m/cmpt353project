// const express = require('express');
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa();
const fs = require('fs')
const router = new Router();
const mysql = require('mysql');
const views = require('koa-views')
const bodyParser = require('koa-bodyparser')

// app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = "127.0.0.1";

// MYSQL Database connection info, can be updated depending on how we want to host/ test
const connection = mysql.createConnection({
    host        :   'localhost',
    user        :   'root',
    password    :   'cmpt353password',
    database    :   'project'
})

// required to avoid absolute pathing
var path = require('path');


app.use(views(path.join(__dirname, 'pages'), {extension: 'html'}));
app.use(bodyParser());
// render(app, {
//     root: path.join(__dirname, 'pages'),
//     viewExt: 'html'
// })

// Establish connection to the database
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

// Load main page on startup
router.get('/', async (ctx, next) => {
    await ctx.render('index');
});


// as cool as the idea of a general page loader was, it was hard and ugly to even try to implement (trying to render a filestream).
// Because it's simple I'll just implement GETs for each
// The actual process of redirecting to these GETs is in the .html
router.get('/staff/add', async (ctx, next) => {
    await ctx.render('add_staff');
})
router.get('/customers/add', async (ctx, next) => {
    await ctx.render('add_customer');
})
router.get('/staff/change', async (ctx, next) => {
    await ctx.render('change_staff');
})
router.get('/customers/change', async (ctx, next) => {
    await ctx.render('change_customer');
})
router.get('/report', async (ctx, next) => {
    await ctx.render('add_report');
})
router.get('/staff', async (ctx, next) => {
    await ctx.render('view_staff');
})
router.get('/customers', async (ctx, next) => {
    await ctx.render('view_customers');
})


// posts for accessing database stuff
// Some notes: _change posts will ideally take in all modifiable var (name, age, etc) and use a flag for values to be left unchanged (instead of new posts for changing each var)
// staff

router.post('/staff_reg', async (ctx, next) => {
    let fName = ctx.request.body.firstName, lName = ctx.request.body.lastName, phoneNumber = ctx.request.body.phoneNumber, notes = ctx.request.body.notes;

    // Inserting new Staff
    connection.query({
        sql : 'INSERT INTO staff (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'
    }, function (err){
        if (err) throw err;
        console.log("1 record inserted into staff");
    });
})

router.post('/staff_change', async (ctx, next) => {
    let id = ctx.request.body.id;
    let fName = ctx.request.body.firstName, lName = ctx.request.body.lastName, phoneNumber = ctx.request.body.phoneNumber, notes = ctx.request.body.notes;

    connection.query({
        sql : 'UPDATE staff' +
            ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
            'WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record updated in staff");
    });
})

router.post('/staff_del', async (ctx, next) => {
    let id = ctx.request.body.id;

    connection.query({
        sql : 'DELETE FROM staff WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record deleted from staff");
    });
})
router.get('/staff_view', async (ctx, next) => {
    // var name = ctx.request.body.name;
    //TODO: find customer id by name in SQL
    //      get details from that customer
    //      use id to get list of reports from report DB
    //      make gabe figure out how to return data in usable (parsable string?) format for .html

    //Query Database for customer id of a given first and last name

    function evilPrimise() {
        return new Promise(function(resolve, reject) {
            connection.query({
                sql : 'SELECT * FROM staff'
            }, async function (err, result, fields) {
                if (err) throw err;
        
                answer = ''
                result.forEach(element => {
                    answer += element.id + "|"
                    answer += element.first_name + "|"
                    answer += element.last_name + "|"
                    answer += element.phone_number + "|"
                    answer += element.notes + "|"
                });
                resolve(answer)
                
                });

        })
    }
    ctx.response.body = await evilPrimise();
    ctx.status = 200;

    

    
        

        
        

        // let row = result[key];
        // let customerID = row.id

            // Add the report into reports with the customers id
            // connection.query({
            //     sql : 'INSERT INTO reports (customer_id, report) VALUES ("'+customerID+'", "'+report+'")'
            // }, function (err, result, fields) {
            //     if (err) throw err;
            //     console.log("1 record inserted into records");
            // });

    // });

    // res.send(`OK, here is ${name}'s details`) // this will eventually be readable data
})


// customers
router.post('/customer_reg', async (ctx, next) => {
    let fName = ctx.request.body.firstName, lName = ctx.request.body.lastName, phoneNumber = ctx.request.body.phoneNumber, notes = ctx.request.body.notes;

    // Inserting new Customer
    connection.query({
        sql : 'INSERT INTO customers (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'
    }, function (err){
        if (err) throw err;
        console.log("1 record inserted int customers");
    });
})

router.post('/customer_change', async (ctx, next) => {
    let id = ctx.request.body.id;
    let fName = ctx.request.body.firstName, lName = ctx.request.body.lastName, phoneNumber = ctx.request.body.phoneNumber, notes = ctx.request.body.notes;

    connection.query({
        sql : 'UPDATE customers' +
            ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
            'WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record updated in customers");
    });
})

router.post('/customer_del', async (ctx, next) => {
    let id = ctx.request.body.id;

    connection.query({
        sql : 'DELETE FROM customers WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record deleted from customers");
    });
})

router.post('/customer_report', async (ctx, next) => {
    let fName = ctx.request.body.firstName, lName = ctx.request.body.lastName, report = ctx.request.body.report;

    //Query Database for customer id of a given first and last name
    connection.query({
        sql : 'SELECT * FROM customers WHERE last_Name = "'+lName+'" AND first_name = "'+fName+'"'
    }, function (err, result, fields) {
        if (err) throw err;

        // Organize data from query
        Object.keys(result).forEach(function(key) {
            let row = result[key];
            let customerID = row.id

            // Add the report into reports with the customers id
            connection.query({
                sql : 'INSERT INTO reports (customer_id, report) VALUES ("'+customerID+'", "'+report+'")'
            }, function (err, result, fields) {
                if (err) throw err;
                console.log("1 record inserted into records");
            });
        });
    });
})

router.get('/get_reports', async (ctx, next) => {
    let id = ctx.request.body.id;

    function evilPrimise() {
        return new Promise(function(resolve, reject) {
            connection.query({
                sql : 'SELECT * FROM reports WHERE customer_id = "'+id+'"'
            }, async function (err, result, fields) {
                if (err) throw err;
        
                answer = ''
                result.forEach(e => {
                    answer += e.id + '|'
                    answer += e.report + '|'
                });
                resolve(answer)
                
                });

        })
    }
    ctx.response.body = await evilPrimise();
    ctx.status = 200;

    // connection.query({
    //     sql : 'SELECT * FROM reports WHERE customer_id = "'+id+'"'
    // }, function (err, result){
    //     if (err) throw err;
    //     answer = ''
    //     result.forEach(e => {
    //         answer += e.id + '|'
    //         answer += e.report + '|'
    //     });
    //     ctx.body=(answer);
    // });


})

router.get('/customer_view', async (ctx, next) => {
    // var name = ctx.request.body.name;
    //TODO: find customer id by name in SQL
    //      get details from that customer
    //      use id to get list of reports from report DB
    //      make gabe figure out how to return data in usable (parsable string?) format for .html

    //Query Database for customer id of a given first and last name

    function evilPrimise() {
        return new Promise(function(resolve, reject) {
            connection.query({
                sql : 'SELECT * FROM customers'
            }, async function (err, result, fields) {
                if (err) throw err;
        
                answer = ''
                result.forEach(element => {
                    answer += element.id + "|"
                    answer += element.first_name + "|"
                    answer += element.last_name + "|"
                    answer += element.phone_number + "|"
                    answer += element.notes + "|"
                });
                resolve(answer)
                
                });

        })
    }
    ctx.response.body = await evilPrimise();
    ctx.status = 200;
        

        // let row = result[key];
        // let customerID = row.id

            // Add the report into reports with the customers id
            // connection.query({
            //     sql : 'INSERT INTO reports (customer_id, report) VALUES ("'+customerID+'", "'+report+'")'
            // }, function (err, result, fields) {
            //     if (err) throw err;
            //     console.log("1 record inserted into records");
            // });

    });

    // res.send(`OK, here is ${name}'s details`) // this will eventually be readable data





// I don't know what this does but I have it from a previous assignment. Commenting it out doesn't seem to affect anything
app.use(router.routes());


app.listen(PORT,HOST, (err) => {
    if (err) {
        console.log(`Failure to listen on ${HOST}:${PORT}`)
    }
    else {
        console.log(`listening on ${HOST}:${PORT}`)
    }
})