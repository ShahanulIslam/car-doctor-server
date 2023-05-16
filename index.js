const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 5000;

// MIddleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eo2hmpk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const serviceCollection = client.db("carDoctor").collection("services");
        const serviceBookCollection = client.db("carDoctor").collection("servicesBook")

        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                // Include only the `title` and `imdb` fields in each returned document
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options)
            res.send(result)
        })

        app.get("/booking", async (req, res) => {
            // console.log(req.query.email)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await serviceBookCollection.find(query).toArray();
            res.send(result)
        })

        app.post("/booking", async (req, res) => {
            const booking = req.body;
            const result = await serviceBookCollection.insertOne(booking);
            res.send(result);
        })

        app.patch("/booking/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBookings = req.body;
            const updateDoc = {
                $set: {
                   status : updatedBookings.status
                },
            };
            const result = await serviceBookCollection.updateOne(filter,updateDoc);
            res.send(result)

        })

        app.delete("/booking/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceBookCollection.deleteOne(query)
            res.send(result)
        })

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Car Doctor server is running")
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})