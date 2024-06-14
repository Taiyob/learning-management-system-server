const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { status } = require("express/lib/response");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://learning-management:JBKmo8ExLxtwTYdy@cluster0.9bycbcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const usersCollection = client.db("parlour").collection("usersDB");

    // create user (register)
    app.post("/user-register", async (req, res) => {
      const body = req.body;
      try {
        const result = await usersCollection.insertOne(body);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error registering user:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
    });

    // get all user from database
    app.get("/user-get", async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.status(201).send(result);
      } catch (e) {
        console.error("Error find user:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
    });

    // get single user from database
    app.get("/user-data/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.findOne(query);
        res.status(201).send(result);
      } catch (e) {
        console.error("Error find user:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
    });

    // update user
    app.patch("/user-update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const body = req.body;
        const result = await usersCollection.updateOne(query, { $set: body });
        res.status(201).send(result);
      } catch (e) {
        console.error("Error find user:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
