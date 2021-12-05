const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const sqlite3 = require('sqlite3').verbose();

const loadtest = require('loadtest');

const options = {
    url: 'http://localhost:8080/customer_report',
    maxRequests: 0,
    concurrency: 2,
    method: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    body: {
        firstName: 'Caleb',
        lastName: 'Milo',
        report: 'Has a pet cat'
    }
};

app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = "127.0.0.1";

// MYSQL Database connection info, can be updated depending on how we want to host/ test
let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

db.serialize(() => {
    let sql = 'CREATE TABLE IF NOT EXISTS staff (' +
        'id INTEGER NOT NULL PRIMARY KEY, last_name TEXT NOT NULL, first_name TEXT NOT NULL, phone_number TEXT NOT NULL,' +
        ' notes TEXT NOT NULL);'
    db.run(sql);

    sql = 'CREATE TABLE IF NOT EXISTS customers (' +
        'id INTEGER NOT NULL PRIMARY KEY, last_name TEXT NOT NULL, first_name TEXT NOT NULL, phone_number TEXT NOT NULL,' +
        ' notes TEXT NOT NULL);'
    db.run(sql);

    sql = 'CREATE TABLE IF NOT EXISTS reports (' +
        'id INTEGER NOT NULL PRIMARY KEY, customer_id INTEGER NOT NULL, report TEXT NOT NULL);'
    db.run(sql);
});


// required to avoid absolute pathing
let path = require('path');


// Load main page on startup
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, './pages') });
});


// as cool as the idea of a general page loader was, it was hard and ugly to even try to implement (trying to render a filestream).
// Because it's simple I'll just implement GETs for each
// The actual process of redirecting to these GETs is in the .html
app.get('/staff/add', (req, res) => {
    res.sendFile('add_staff.html', { root: path.join(__dirname, './pages') });
})
app.get('/customers/add', (req, res) => {
    res.sendFile('add_customer.html', { root: path.join(__dirname, './pages') });
})
app.get('/staff/change', (req, res) => {
    res.sendFile('change_staff.html', { root: path.join(__dirname, './pages') });
})
app.get('/customers/change', (req, res) => {
    res.sendFile('change_customer.html', { root: path.join(__dirname, './pages') });
})
app.get('/report', (req, res) => {
    res.sendFile('add_report.html', { root: path.join(__dirname, './pages') });
})
app.get('/staff', (req, res) => {
    res.sendFile('view_staff.html', { root: path.join(__dirname, './pages') });
})
app.get('/customers', (req, res) => {
    res.sendFile('view_customers.html', { root: path.join(__dirname, './pages') });
})


// posts for accessing database stuff
// Some notes: _change posts will ideally take in all modifiable var (name, age, etc) and use a flag for values to be left unchanged (instead of new posts for changing each var)
// staff

app.post('/staff_reg', (req, res) => {
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;
    let sql = 'INSERT INTO staff (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'

    // Inserting new Staff
    db.run( sql, (err) =>{
        if (err) throw err;
        console.log("1 record inserted into staff");
    });


    res.send(`OK, added ${fName} to staff`) // or, depending on implementation, this can be a list of registered staff with details
})

app.post('/staff_change', (req, res) => {
    let id = req.body.id;
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;

    let sql = 'UPDATE staff' +
        ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
        'WHERE id = "'+id+'"';

    db.run(sql, (err) => {
        if (err) throw err;
        console.log("1 record updated in staff");
    });

    res.send(`OK, record changed for staff ${id}`) // or, depending on implementation, this can be a list of registered staff
})

app.post('/staff_del', (req, res) => {
    let id = req.body.id;
    let sql = 'DELETE FROM staff WHERE id = "'+id+'"';

    db.run(sql, (err) => {
        if (err) throw err;
        console.log("1 record deleted from staff");
    });

    res.send(`OK, deleted ${id} from staff`) // or, depending on implementation, this can be a list of registered staff
})
app.get('/staff_view', (req, res) => {

    //Query Database for customer id of a given first and last name
    db.all( 'SELECT * FROM staff', [], (err, rows) =>{
        if (err) throw err;

        answer = ''
        rows.forEach((row) => {
            answer += row.id + "|"
            answer += row.first_name + "|"
            answer += row.last_name + "|"
            answer += row.phone_number + "|"
            answer += row.notes + "|"
        });

        res.send(answer)
        

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
})


// customers
app.post('/customer_reg', (req, res) => {
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;
    let sql = 'INSERT INTO customers (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'

    // Inserting new customer
    db.run(sql, (err) =>{
        if (err) throw err;
        console.log("1 record inserted into customers");
    });

    res.send(`OK, added ${fName} to customers`) // or, depending on implementation, this can be a list of registered customers with data
})

app.post('/customer_change', (req, res) => {
    let id = req.body.id;
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;

    let sql = 'UPDATE customers' +
        ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
        'WHERE id = "'+id+'"';

    db.run(sql, (err) => {
        if (err) throw err;
        console.log("1 record updated in customers");
    });

    res.send(`OK, record changed for customer ${id}`) // or, depending on implementation, this can be a list of registered customers
})

app.post('/customer_del', (req, res) => {
    let id = req.body.id;

    let sql = 'DELETE FROM customers WHERE id = "'+id+'"';

    db.run(sql, (err) => {
        if (err) throw err;
        console.log("1 record deleted from customers");
    });

    res.send(`OK, deleted ${id} from customers`) // or, depending on implementation, this can be a list of registered customers
})

app.post('/customer_report', (req, res) => {
    let fName = req.body.firstName, lName = req.body.lastName, report = req.body.report;

    let sql = 'SELECT * FROM customers WHERE last_Name = "'+lName+'" AND first_name = "'+fName+'"';

    //Query Database for customer id of a given first and last name
    db.all(sql, [], (err, rows ) =>{
        if (err) throw err;

        // Organize data from query
        rows.forEach((row) => {
            let customerID = row.id

            // Add the report into reports with the customers id
            db.run({
                sql : 'INSERT INTO reports (customer_id, report) VALUES ("'+customerID+'", "'+report+'")'
            }, function (err, result, fields) {
                if (err) throw err;
                console.log("1 record inserted into records");
            });
        });
    });

    res.send(`OK, added ${lName}'s report`) // or, depending on implementation, this can be a list of the registered customers (or of that specific customers reports)
})

app.post('/get_reports', (req, res) => {
    let id = req.body.id;
    let sql = 'SELECT * FROM reports WHERE customer_id = "'+id+'"';

    db.all(sql, [], (err, rows) => {
        if (err) throw err;

        let answer = ''
        rows.forEach(row => {
            answer += row.id + '|'
            answer += row.report + '|'
        });
        res.send(answer);
    });


})

app.get('/customer_view', (req, res) => {

    //Query Database for customer id of a given first and last name
    db.all( 'SELECT * FROM customers', [], (err, rows) =>{
        if (err) throw err;

        answer = ''
        rows.forEach((row) => {
            answer += row.id + "|"
            answer += row.first_name + "|"
            answer += row.last_name + "|"
            answer += row.phone_number + "|"
            answer += row.notes + "|"
        });

        res.send(answer)
        

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
})





// I don't know what this does but I have it from a previous assignment. Commenting it out doesn't seem to affect anything
app.use('/', express.static('pages'));


app.listen(PORT,HOST, (err) => {
    if (err) {
        console.log(`Failure to listen on ${HOST}:${PORT}`)
    }
    else {
        console.log(`listening on ${HOST}:${PORT}`)
    }
})

fs = require('fs');

loadtest.loadTest(options, function(error, result)
{
    if (error)
    {
        return console.error('Got an error: %s', error);
    }
    let data = ''
    data += "RPS: "+ result.rps + '\n'
    data += "Total Time: "+ result.totalTimeSeconds + '\n'
    data += 'Mean Latency: ' + result.meanLatencyMs + '\n'
    data += 'Max Latency: ' + result.maxLatencyMs + '\n'
    data += 'Total Errors: ' + result.totalErrors

    fs.writeFile('out.txt', data, function (err){

    });

});