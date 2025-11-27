const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// midlewear
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdcjmvl.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const db = client.db("ejp-project");
        const productsCollection = db.collection("products");
        const purchasedProducts = db.collection("boughtProducts")

        // get products

        app.get("/products", async (req, res) => {
            const result = await productsCollection.find().limit(6).toArray();
            res.send(result);
        });

        // Get all products (with optional search by title)
        app.get("/allproducts", async (req, res) => {
            const search = req.query.search || "";
            let query = {};

            if (search) {
                query = { title: { $regex: search, $options: "i" } };
            }

            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        // get product details by id
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const product = await productsCollection.findOne({ _id: new ObjectId(id) });
            res.json(product);
        });

        // add product from client
        app.post("/addProduct", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });
        // Buy product to show
        app.get("/buy", async(req, res) => {
            const email = req.query.email;
            const products = await purchasedProducts.find({email}).toArray();
            res.send(products)
        })

        // Buy Product
        app.post("/buy", async(req, res) => {
            const { title, price, email } = req.body;
            const result = await purchasedProducts.insertOne({ title, price, email });
            res.send(result)
        })
        // delete bought product
        app.delete("/buy/:id", async(req, res) => {
            const id = req.params.id;
            const email = req.query.email
            const result = await purchasedProducts.deleteOne({_id : new ObjectId(id),email:email})
            res.send(result)
        })

        //  Delete product
        // app.delete("/product/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
        //     res.json(result);
        // });

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("EJP is running here");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
