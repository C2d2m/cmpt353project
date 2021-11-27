const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = "127.0.0.1";

// required to avoid absolute pathing
var path = require('path');


// TODO: database implementation / connection


// Load main page on startup 
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, './pages') });
});


// as cool as the idea of a general page loader was, it was hard and ugly to even try to implement (trying to render a filestream). 
// Because it's simple I'll just implement GETs for each
// The actual process of redirecting to these GETs is in the .html
app.get('/1', (req, res) => {
    res.sendFile('sub1.html', { root: path.join(__dirname, './pages') });
})
app.get('/2', (req, res) => {
    res.sendFile('sub2.html', { root: path.join(__dirname, './pages') });
})
app.get('/3', (req, res) => {
    res.sendFile('sub3.html', { root: path.join(__dirname, './pages') });
})


// posts for accessing database stuff
// Some notes: _change posts will ideally take in all modifiable var (name, age, etc) and use a flag for values to be left unchanged (instead of new posts for changing each var) 
// staff
app.post('/staff_reg', (req, res) => {
    var name = req.body.name;
    // TODO: enter into sql db table (autoincrement?)
    res.send(`OK, added ${name} to staff`) // or, depending on implementation, this can be a list of registered staff with details
})

app.post('/staff_change', (err, req, res) => {
    var name = req.body.name;
    var newName = req.body.newName; // for example, change the name of some staff to a new name
    // TODO: find staff id by name in SQL, change their name field
    res.send(`OK, changed ${name} to ${newName} for staff`) // or, depending on implementation, this can be a list of registered staff
})

app.post('/staff_del', (err, req, res) => {
    var name = req.body.name;
    // TODO: find staff id by name in SQL, delete them
    res.send(`OK, deleted ${name} from staff`) // or, depending on implementation, this can be a list of registered staff
})


// customers
app.post('/customer_reg', (err, req, res) => {
    var name = req.body.name;
    // TODO: enter into sql db table (autoincrement?)
    res.send(`OK, added ${name} to customers`) // or, depending on implementation, this can be a list of registered customers with data
})

app.post('/customer_change', (err, req, res) => {
    var name = req.body.name;
    var newName = req.body.newName; // for example, change the name of some customer to a new name. 
    // TODO: find customer id by name in SQL, change their name field
    res.send(`OK, changed ${name} to ${newName} for customer`) // or, depending on implementation, this can be a list of registered customers
})

app.post('/customer_del', (err, req, res) => {
    var name = req.body.name;
    // TODO: find customer id by name in SQL, delete them
    res.send(`OK, deleted ${name} from customers`) // or, depending on implementation, this can be a list of registered customers 
})

app.post('/customer_report', (err, req, res) => {
    var report = req.body.report; // Probably some long ass string
    var name = req.body.name;
    //TODO: find customer id by name in SQL
    //      add (autoincrement) report to SQL table for reports, tagging with customer id      
    res.send(`OK, added ${name}'s report`) // or, depending on implementation, this can be a list of the registered customers (or of that specific customers reports)
})

app.post('/customer_view', (err, req, res) => {
    var name = req.body.name;
    //TODO: find customer id by name in SQL
    //      get details from that customer
    //      use id to get list of reports from report DB
    //      make gabe figure out how to return data in usable (parsable string?) format for .html
    res.send(`OK, here is ${name}'s details`) // this will eventually be readable data
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