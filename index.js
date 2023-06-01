const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


/**
 * ---------------------------------------------------------------
 */


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hcsitps.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();    
        client.connect();

        const toysCollection = client.db("toyDB").collection("toys");
        const customToyCollection = client.db("toyDB").collection("customToy");


        /**
         * --------------------------------------------------------------------------------
         *                                TOYS COLLECTION
         * --------------------------------------------------------------------------------
         */
        // FETCH / GET ALL TOYS
        app.get('/toys', async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result);
        });

        // GET A SINGLE TOY
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        /**
         * --------------------------------------------------------------------------------
         *                                CUSTOM TOY COLLECTION
         * --------------------------------------------------------------------------------
         */

        // READ CUSTOM TOY
        app.get('/custom-toy', async (req, res) => {
            // console.log(req.query);
            let query = {};
            if (req.query?.email) {
                query = {
                    sellerEmail: req.query.email
                }
            }
            const result = await customToyCollection.find(query).toArray();
            res.send(result);

        });

        // CREATE TOY
        app.post('/custom-toy', async (req, res) => {
            const toy = req.body;
            // console.log(toy);
            const result = await customToyCollection.insertOne(toy);
            res.send(result);
        });

        // EDIT TOY
        app.get('/custom-toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await customToyCollection.findOne(query);
            res.send(result);
        });

        // UPDATE TOY
        app.put('/custom-toy/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            console.log(id, toy);
            const query = { _id: new ObjectId(id)};
            const options = { upsert : true };
            const updatedToy = {
                $set: {
                    name : toy.name,
                    image : toy.image,
                    price : toy.price,
                    rating : toy.rating,
                    sellerName : toy.sellerName,
                    sellerEmail : toy.sellerEmail,
                    category : toy.category,
                    quantity : toy.quantity,
                    details : toy.details
                }
            }
            const result = await customToyCollection.updateOne(query, updatedToy, options);
            res.send(result);
        });

        // DELETE TOY
        app.delete('/custom-toy/:id', async (req, res) => {
            const id = req.params.id;
            console.log('Deleted id : ', id);
            const query = { _id : new ObjectId(id)};
            const result = await customToyCollection.deleteOne(query);
            res.send(result);
        });


        /**
         * --------------------------------------------------------------------------------
         *                                ALL TOY 
         * --------------------------------------------------------------------------------
         */

        // READ ALL TOYS
        app.get('/all-toys', async (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            const result = await customToyCollection.find().limit(limit).toArray();
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

/**
 * ---------------------------------------------------------------
 */


app.get('/', (req, res) => res.send('Bismillahir Rahmanir Rahim! Assignment 11'));
app.listen(port, () => console.log(`Server is running from port : ${port}`));