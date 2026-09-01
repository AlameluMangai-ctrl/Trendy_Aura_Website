const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 1000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ==========================================
// SERVE WEBSITE
// ==========================================

app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// MYSQL CONNECTION
// ==========================================

const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "root",

    database: "trendyaura"

});


db.connect((err) => {

    if (err) {

        console.log("MySQL connection failed:");
        console.log(err.message);

    } else {

        console.log("Connected to MySQL successfully!");

    }

});


// ==========================================
// WEBSITE PAGES
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


app.get("/guide", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "guide.html")
    );

});


app.get("/care", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "care.html")
    );

});


app.get("/products", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "products.html")
    );

});


app.get("/customize", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "customize.html")
    );

});


app.get("/login", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );

});


app.get("/account", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "account.html")
    );

});


// ==========================================
// REGISTER
// ==========================================

app.post("/register", (req, res) => {

    const { name, email, password } = req.body;


    if (!name || !email || !password) {

        return res.json({

            success: false,

            message: "Please fill all fields."

        });

    }


    const sql = `

        INSERT INTO users
        (name, email, password)

        VALUES (?, ?, ?)

    `;


    db.query(

        sql,

        [name, email, password],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.json({

                    success: false,

                    message:
                    "Email already registered or database error."

                });

            }


            res.json({

                success: true,

                message:
                "Account created successfully!"

            });

        }

    );

});


// ==========================================
// LOGIN
// ==========================================

app.post("/login", (req, res) => {

    const { email, password } = req.body;


    const sql = `

        SELECT id, name, email

        FROM users

        WHERE email = ?

        AND password = ?

    `;


    db.query(

        sql,

        [email, password],

        (err, results) => {

            if (err) {

                return res.json({

                    success: false,

                    message: "Database error."

                });

            }


            if (results.length === 0) {

                return res.json({

                    success: false,

                    message:
                    "Invalid email or password."

                });

            }


            res.json({

                success: true,

                message: "Login successful!",

                user: results[0]

            });

        }

    );

});


// ==========================================
// GET PRODUCTS
// ==========================================

app.get("/api/products", (req, res) => {

    const sql = `
        SELECT *
        FROM products
        ORDER BY id
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({

                message: "Unable to load products."

            });

        }


        res.json(results);

    });

});


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

app.get("/api/products/:id", (req, res) => {

    const productId = req.params.id;


    const sql = `

        SELECT *

        FROM products

        WHERE id = ?

    `;


    db.query(

        sql,

        [productId],

        (err, results) => {

            if (err) {

                return res.status(500).json({

                    message: "Database error."

                });

            }


            if (results.length === 0) {

                return res.status(404).json({

                    message: "Product not found."

                });

            }


            res.json(results[0]);

        }

    );

});


// ==========================================
// SAVE CUSTOMIZATION
// ==========================================

app.post("/customize", (req, res) => {

    const {

        user_id,
        product_id,
        color,
        size,
        customization_details

    } = req.body;


    if (!product_id || !color || !size) {

        return res.json({

            success: false,

            message:
            "Please select product, color and size."

        });

    }


    const sql = `

        INSERT INTO customizations

        (
            user_id,
            product_id,
            color,
            size,
            customization_details
        )

        VALUES (?, ?, ?, ?, ?)

    `;


    db.query(

        sql,

        [

            user_id || null,

            product_id,

            color,

            size,

            customization_details || ""

        ],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.json({

                    success: false,

                    message:
                    "Unable to save customization."

                });

            }


            res.json({

                success: true,

                customization_id: result.insertId,

                message:
                "Your customization request has been submitted!"

            });

        }

    );

});


// ==========================================
// GET CUSTOMER CUSTOMIZATIONS
// ==========================================

app.get(
    "/api/customizations/:userId",
    (req, res) => {

        const userId = req.params.userId;


        const sql = `

            SELECT

                c.id,

                c.color,

                c.size,

                c.customization_details,

                c.created_at,

                p.name AS product_name,

                p.price

            FROM customizations c

            JOIN products p

            ON c.product_id = p.id

            WHERE c.user_id = ?

            ORDER BY c.id DESC

        `;


        db.query(

            sql,

            [userId],

            (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                        "Unable to load customizations."

                    });

                }


                res.json(results);

            }

        );

    }

);


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("");

    console.log("========================================");

    console.log("       TRENDY AURA WEBSITE");

    console.log("========================================");

    console.log("");

    console.log(
        "Website: http://localhost:" + PORT
    );

    console.log("");

    console.log("========================================");

});