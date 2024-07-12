const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const path = require('path');

const PORT = process.env.PORT || 4000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 48 * 60 * 60 * 1000 }
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/static', express.static(path.join(__dirname, 'views', 'scripts')));


// Endpunkte definieren
app.get("/", (req, res) => {
    res.render("./Public/index.ejs");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("./Public/register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
    res.render("./Public/login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("./LoggedIn/dashboard.ejs", { user: req.user.prename });
});

app.get("/users/customers", checkNotAuthenticated, (req, res) => {
    res.render("./LoggedIn/customers.ejs");
});

app.get("/users/customers/data", async (req, res) => {
    
    try {
        if (!req.user) {
            console.error("User not authenticated");
            return res.status(401).json({ error: "User not authenticated" });
        }

        const userId = req.user.id;
        console.log(`Fetching customers for user ID: ${userId}`);

        const results = await pool.query('SELECT * FROM customers WHERE benutzer_id = $1', [userId]);
        console.log('Query successful. Results:', results.rows);

        res.json(results.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/users/bills", checkNotAuthenticated, (req, res) => {
    res.render("./LoggedIn/bills.ejs");
});

// Lade Kundendaten für die PDF-Erstellung
app.get("/users/bills/customdata", async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await pool.query('SELECT * FROM customers WHERE benutzer_id = $1', [userId]);
        console.log('Query successful. Results:', results.rows);
        res.json(results.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Lade Unternehmerdaten für die PDF Kopf- und Fußzeile
app.get("/users/bills/ownerData", (req, res) => {
    try {
        const userId = req.user.id;
        const name = req.user.name;
        const prename = req.user.prename;
        const address = req.user.address;
        const plz = req.user.plz;
        const town = req.user.town;

        res.json({
            userId,
            name,
            prename,
            address,
            plz,
            town
        });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/users/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You have logged out successfully');
        res.redirect("/users/login");
    });
});

app.post("/users/register", async (req, res) => {
    let { name, prename, email, password, password2, adress, plz, town  } = req.body;
    let errors = [];

    if (!name || !prename || !email || !password || !password2 || !adress || !plz || !town) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        res.render("register", { errors, name, email, password, password2 });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`,
            [email],
            (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results.rows);

            if (results.rows.length > 0) {
                return res.render("register", {
                    message: "Email already registered"
            });
            }   else {
                    pool.query(
                        `INSERT INTO users (name, prename, email, password, adress, plz, town)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id, password`,
                        [name, prename, email, hashedPassword, adress, plz, town],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "You are now registered. Please log in");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        );
    }
});

app.post("/users/customers", (req, res) => {
    const benutzer_id = req.user.id; // Benutzer-ID aus der Session oder dem Token holen
    const { gender, name, prename, adress, plz, town } = req.body;
    
    console.log(benutzer_id, gender, name, prename, adress, plz, town);

    pool.query(
        `INSERT INTO customers (benutzer_id, gender, name, prename, adress, plz, town)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [benutzer_id, gender, name, prename, adress, plz, town],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);
            req.flash("success_msg", "Kunde wurde erfolgreich hinzugefügt :)");
            res.redirect("/users/customers");
        }
    );
});


app.post("/users/login",
    passport.authenticate("local", {
        successRedirect: "/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })
);

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});