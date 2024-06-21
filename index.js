const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { status } = require("express/lib/response");
require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9bycbcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //await client.connect();

    const usersCollection = client.db("learning-management-system").collection("usersDB");
    const courseCollection = client.db("learning-management-system").collection("coursesDB");

    // token genarate
    function createToken(user) {
      const token = jwt.sign(
        { email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return token;
    }

    //verify token
    function verifyToken(req, res, next) {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .send({ message: "Unauthorized. Token missing or invalid." });
      }

      const token = authorizationHeader.split(" ")[1];

      try {
        const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!verify?.email) {
          return res.status(403).send({ message: "Forbidden. Invalid token." });
        }
        req.user = verify.email;
        next();
      } catch (error) {
        return res.status(500).send({ message: "Internal Server Error" });
      }
    }

    // create user (register)
    app.post("/user-register", async (req, res) => {
      const body = req.body;
      try {
        const token = createToken(body.email);
        const userExist = await usersCollection.findOne({ email: body.email });
        if (userExist) {
          return res.status(200).send({
            status: "success",
            message: "Email already exists!, please login...",
            token: token,
          });
        }
        const result = await usersCollection.insertOne(body);
        res.status(201).send({
          status: "success",
          message: "User registered successfully",
          //token: token,
        });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send({
          status: "error",
          message: "Internal Server Error",
          error: error.message,
        });
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

    //create course
    app.post('/create-course', verifyToken, async (req, res) => {
      try{
        const body = req.body;
        const result = await courseCollection.insertOne(body);
        res.status(201).send({message: "New course created", result});
      }catch(error){
        res.status(500).send({ error: "Internal Server Error", message: error.message})
      }
    })

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
