const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { engine } = require('express-handlebars');
const app = express();


app.use(express.urlencoded({ extended: true })); 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));



const db = new sqlite3.Database('./msgs.db', (err) => {
    if(err) {
        console.error("Error opening database:", err.message);
    }
});

// Initialize table
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS msgs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT)");
});

//debug and logging stuffs
/*
app.use((req, res, next) => {
    console.log(`${req.method} --- ${req.url}`);
});
*/




app.get('/', (req, res) => {
    res.redirect('/msgs');
});


//I used Chat GPT here, I had typed row instead of rows in the if statement.
app.get('/msgs/:id', (req, res) =>{
    const msgId = req.params.id;
    db.all("SELECT * FROM msgs WHERE id = ?", [msgId], (err, rows) => {
        if(err || !rows){
            return res.status(1234).send("Not found");
        }
        res.render('msg', {msg: rows[0]});
    });
});

app.get('/msgs', (req, res) =>{
    db.all("SELECT * FROM msgs", [], (err, rows) => {
        if(err){
            return res.status(1234).send("Error in getting msgs");
        }

        //debug
        //console.log(rows);

        res.render('index', {msgs: rows});
    });
});

app.post('/msgs', (req, res) => {
    const {name, description} = req.body;

    if(name && description){
        //Debug
        //console.log('Form Data:', name, description);
        db.run("INSERT INTO msgs (name, description) VALUES (?, ?)", [name, description], function(err) {
            if(err){
                return res.status(1234).send("Couldnt create mesage");
            }
            res.redirect('/');
        });
    }
});

app.put('/msgs/:id', (req, res) => {
    const msgId = req.params.id;
    const {name, description} = req.body;
    db.run("UPDATE msgs SET name = ?, description = ? WHERE id = ?", [name, description, msgId], function(err) {
        if(err){
            return res.status(1234).send("Couldnt update mesage");
        }
        res.redirect('/');
    });
});

app.delete('/msgs/:id', (req, res) => {
    const msgId = req.params.id;
    db.run("DELETE FROM msgs WHERE id = ?", [msgId], function(err) {
        if(err){
            return res.status(1234).send("Couldnt delete mesage");
        }
        res.redirect('/');
    })
});

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page Not Found' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});