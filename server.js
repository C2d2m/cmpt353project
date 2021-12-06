const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mysql = require('mysql');

app.use(bodyParser.urlencoded({ extended: true }));

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

// Establish connection to the database
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

// Load main page on startup
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, './pages') });
});


// Staff page gets
app.get('/staff', (req, res) => {
    res.sendFile('view_staff.html', { root: path.join(__dirname, './pages') });
})
app.get('/staff/add', (req, res) => {
    res.sendFile('add_staff.html', { root: path.join(__dirname, './pages') });
})
app.get('/staff/change', (req, res) => {
    res.sendFile('change_staff.html', { root: path.join(__dirname, './pages') });
})

// Customer page gets
app.get('/customers', (req, res) => {
    res.sendFile('view_customers.html', { root: path.join(__dirname, './pages') });
})
app.get('/customers/add', (req, res) => {
    res.sendFile('add_customer.html', { root: path.join(__dirname, './pages') });
})
app.get('/customers/change', (req, res) => {
    res.sendFile('change_customer.html', { root: path.join(__dirname, './pages') });
})

// Report get
app.get('/report', (req, res) => {
    res.sendFile('add_report.html', { root: path.join(__dirname, './pages') });
})



// posts for accessing database stuff
// Some notes: _change posts will ideally take in all modifiable var (name, age, etc) and use a flag for values to be left unchanged (instead of new posts for changing each var)
// staff

// STAFF METHODS
// Send a list with all the info for the staff in the database
app.get('/staff_view', (req, res) => {

    //Query Database for customer id of a given first and last name
    connection.query({
        sql : 'SELECT * FROM staff'
    }, function (err, result) {
        if (err) throw err;
        let answer = ''
        result.forEach(element => {
            answer += element.id + "|"
            answer += element.first_name + "|"
            answer += element.last_name + "|"
            answer += element.phone_number + "|"
            answer += element.notes + "|"
        });

        res.send(answer)
    });
})

// Add new staff
app.post('/staff_reg', (req, res) => {
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;

    // Inserting new Staff
    connection.query({
        sql : 'INSERT INTO staff (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'
    }, function (err){
        if (err) throw err;
        console.log("1 record inserted into staff");
    });

    res.send(`OK, added ${fName} ${lName} to staff`) // or, depending on implementation, this can be a list of registered staff with details
})

// Delete staff row from table
app.post('/staff_del', (req, res) => {
    let id = req.body.id;

    connection.query({
        sql : 'DELETE FROM staff WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record deleted from staff");
    });

    res.send(`OK, deleted #${id} from staff`) // or, depending on implementation, this can be a list of registered staff
})

// Update staff row
app.post('/staff_change', (req, res) => {
    let id = req.body.id;
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;

    connection.query({
        sql : 'UPDATE staff' +
            ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
            'WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record updated in staff");
    });

    res.send(`OK, record changed for staff #${id}`) // or, depending on implementation, this can be a list of registered staff
})

// CUSTOMER METHODS
// Get list of all the customers in the database
app.get('/customer_view', (req, res) => {

    //Query Database for customer id of a given first and last name
    connection.query({
        sql : 'SELECT * FROM customers'
    }, function (err, result) {
        if (err) throw err;
        let answer = ''
        result.forEach(element => {
            answer += element.id + "|"
            answer += element.first_name + "|"
            answer += element.last_name + "|"
            answer += element.phone_number + "|"
            answer += element.notes + "|"
        });
        res.send(answer)
    });
})

// Add new customer to table
app.post('/customer_reg', (req, res) => {
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;

    // Inserting new Customer
    connection.query({
        sql : 'INSERT INTO customers (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'
    }, function (err){
        if (err) throw err;
        console.log("1 record inserted int customers");
    });

    res.send(`OK, added ${fName} ${lName} to customers`) // or, depending on implementation, this can be a list of registered customers with data
})

// Delete customer from table
app.post('/customer_del', (req, res) => {
    let id = req.body.id;

    connection.query({
        sql : 'DELETE FROM customers WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record deleted from customers");
    });

    res.send(`OK, deleted #${id} from customers`) // or, depending on implementation, this can be a list of registered customers
})

// Update row in customer table
app.post('/customer_change', (req, res) => {
    let id = req.body.id;
    let fName = req.body.firstName, lName = req.body.lastName, phoneNumber = req.body.phoneNumber, notes = req.body.notes;

    connection.query({
        sql : 'UPDATE customers' +
            ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
            'WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record updated in customers");
    });

    res.send(`OK, record changed for customer #${id}`) // or, depending on implementation, this can be a list of registered customers
})

// REPORT METHODS
// Send all of the reports for a given customer id
app.post('/get_reports', (req, res) => {
    let id = req.body.id;

    connection.query({
        sql : 'SELECT * FROM reports WHERE customer_id = "'+id+'"'
    }, function (err, result){
        if (err) throw err;
        let answer = ''
        result.forEach(e => {
            answer += e.id + '|'
            answer += e.report + '|'
        });
        res.send(answer);
    });
})

// Add a new report for a customer for a given first and last name
app.post('/customer_report', (req, res) => {
    let fName = req.body.firstName, lName = req.body.lastName, report = req.body.report;

    //Query Database for customer id of a given first and last name
    connection.query({
        sql : 'SELECT * FROM customers WHERE last_Name = "'+lName+'" AND first_name = "'+fName+'"'
    }, function (err, result) {
        if (err) throw err;

        if (result.length === 0){
            res.send(`Error, ${fName} ${lName} could not be found`)
            return;
        }

        // Organize data from query
        Object.keys(result).forEach(function(key) {
            let row = result[key];
            let customerID = row.id

            // Add the report into reports with the customers id
            connection.query({
                sql : 'INSERT INTO reports (customer_id, report) VALUES ("'+customerID+'", "'+report+'")'
            }, function (err) {
                if (err) throw err;
                console.log("1 record inserted into records");
                res.send(`OK, added ${fName} ${lName}'s report`)
            });
        });
    });
})

app.use('/', express.static('pages'));

app.listen(PORT,HOST, (err) => {
    if (err) {
        console.log(`Failure to listen on ${HOST}:${PORT}`)
    }
    else {
        console.log(`listening on ${HOST}:${PORT}`)
    }
})