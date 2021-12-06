const fastify = require('fastify');
const fs = require('fs');
const app = fastify();
app.register(require('fastify-formbody'))
const mysql = require('mysql');

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

// Establish connection to the database
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

// Load main page on startup
app.get('/', async (request, reply) => {
    const stream = fs.createReadStream('./pages/index.html')
    reply.type('text/html').send(stream)
});


// as cool as the idea of a general page loader was, it was hard and ugly to even try to implement (trying to render a filestream).
// Because it's simple I'll just implement GETs for each
// The actual process of redirecting to these GETs is in the .html

// Staff Gets
app.post('/redirect', async (request, reply) => {
    let filename = request.body.filename;

    const stream = fs.createReadStream(`./pages/${filename}.html`)
    reply.type('text/html').send(stream)
})

app.get('/staff', async (request, reply) => {
    const stream = fs.createReadStream('./pages/view_staff.html')
    reply.type('text/html').send(stream)
})
app.get('/staff/add', async (request, reply) => {
    const stream = fs.createReadStream('./pages/add_staff.html')
    reply.type('text/html').send(stream)
})
app.get('/staff/change', async (request, reply) => {
    const stream = fs.createReadStream('./pages/change_staff.html')
    reply.type('text/html').send(stream)
})

// Customer Gets
app.get('/customers', async (request, reply) => {
    const stream = fs.createReadStream('./pages/view_customers.html')
    reply.type('text/html').send(stream)
})
app.get('/customers/add', async (request, reply) => {
    const stream = fs.createReadStream('./pages/add_customer.html')
    reply.type('text/html').send(stream)
})
app.get('/customers/change', async (request, reply) => {
    const stream = fs.createReadStream('./pages/change_customer.html')
    reply.type('text/html').send(stream)
})

// Report get
app.get('/report', async (request, reply) => {
    const stream = fs.createReadStream('./pages/add_report.html')
    reply.type('text/html').send(stream)
})


// posts for accessing database stuff
// Some notes: _change posts will ideally take in all modifiable var (name, age, etc) and use a flag for values to be left unchanged (instead of new posts for changing each var)
// staff

// STAFF METHODS
// Send all the staff in the db
app.get('/staff_view', async (request, reply) => {

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

        reply.send(answer)
    });
})

// Add  new staff into db
app.post('/staff_reg', async (request, reply) => {
    let fName = request.body.firstName, lName = request.body.lastName, phoneNumber = request.body.phoneNumber, notes = request.body.notes;

    // Inserting new Staff
    connection.query({
        sql : 'INSERT INTO staff (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'
    }, function (err){
        if (err) throw err;
        console.log("1 record inserted into staff");
    });

    reply.send(`OK, added ${fName} ${lName} to staff`) // or, depending on implementation, this can be a list of registered staff with details
})

// Delete staff from db
app.post('/staff_del', async (request, reply) => {
    let id = request.body.id;

    connection.query({
        sql : 'DELETE FROM staff WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record deleted from staff");
    });

    reply.send(`OK, deleted #${id} from staff`) // or, depending on implementation, this can be a list of registered staff
})

// Update row in staff table
app.post('/staff_change', async (request, reply) => {
    let id = request.body.id;
    let fName = request.body.firstName, lName = request.body.lastName, phoneNumber = request.body.phoneNumber, notes = request.body.notes;

    connection.query({
        sql : 'UPDATE staff' +
            ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
            'WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record updated in staff");
    });

    reply.send(`OK, record changed for staff #${id}`) // or, depending on implementation, this can be a list of registered staff
})

// CUSTOMER GETS
// Send all the customers in the db

app.get('/customer_view', async (request, reply) => {
    //Query Database for customer id of a given first and last name
    connection.query({
        sql : 'SELECT * FROM customers'
    }, function (err, result){
        if (err) throw err;
        let answer = ''
        result.forEach(element => {
            answer += element.id + "|"
            answer += element.first_name + "|"
            answer += element.last_name + "|"
            answer += element.phone_number + "|"
            answer += element.notes + "|"
        });
        reply.send(answer)
    });
})

// Add a new customer
app.post('/customer_reg', async (request, reply) => {
    let fName = request.body.firstName, lName = request.body.lastName, phoneNumber = request.body.phoneNumber, notes = request.body.notes;
    // Inserting new Customer
    connection.query({
        sql : 'INSERT INTO customers (last_name, first_name, phone_number, notes) VALUES ("'+lName+'", "'+fName+'", "'+phoneNumber+'", "'+notes+'")'
    }, function (err){
        if (err) throw err;
        console.log("1 record inserted into customers");
    });

     reply.send(`OK, added ${fName} ${lName} to customers`) // or, depending on implementation, this can be a list of registered customers with data
})

// Delete a new customer
app.post('/customer_del', async (request, reply) => {
    let id = request.body.id;

    connection.query({
        sql : 'DELETE FROM customers WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record deleted from customers");
    });

    reply.send(`OK, deleted #${id} from customers`) // or, depending on implementation, this can be a list of registered customers
})

// Update a row in customers
app.post('/customer_change', async (request, reply) => {
    let id = request.body.id;
    let fName = request.body.firstName, lName = request.body.lastName, phoneNumber = request.body.phoneNumber, notes = request.body.notes;

    connection.query({
        sql : 'UPDATE customers' +
            ' SET first_name = "'+fName+'", last_name = "'+lName+'", phone_number = "'+phoneNumber+'", notes = "'+notes+'"' +
            'WHERE id = "'+id+'"'
    }, function (err){
        if (err) throw err;
        console.log("1 record updated in customers");
    });

    reply.send(`OK, record changed for customer #${id}`) // or, depending on implementation, this can be a list of registered customers
})

// REPORT GETS
// Get reports for a given first and last name
app.post('/customer_report', async (request, reply) => {
    let fName = request.body.firstName, lName = request.body.lastName, report = request.body.report;

    //Query Database for customer id of a given first and last name
    connection.query({
        sql : 'SELECT * FROM customers WHERE last_Name = "'+lName+'" AND first_name = "'+fName+'"'
    }, function (err, result) {
        if (err) throw err;
        if (result.length === 0){
            reply.send(`Error, customer ${fName} ${lName} could not be found`)
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
                reply.send(`OK, added ${fName} ${lName}'s report`)
            });
        });
    });
})

// Add a new report for a given id
app.post('/get_reports', async (request, reply) => {
    let id = request.body.id;

    connection.query({
        sql : 'SELECT * FROM reports WHERE customer_id = "'+id+'"'
    }, function (err, result){
        if (err) throw err;
        let answer = ''
        result.forEach(e => {
            answer += e.id + '|'
            answer += e.report + '|'
        });
        reply.send(answer);
    });
})


// Launch app
app.listen(PORT,HOST, (err) => {
    if (err) {
        console.log(`Failure to listen on ${HOST}:${PORT}`)
    }
    else {
        console.log(`listening on ${HOST}:${PORT}`)
    }
})