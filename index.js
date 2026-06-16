const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.a82ocix.mongodb.net/?appName=Cluster0`;

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

    const db = client.db("hire-loop");
    const jobCollection = db.collection("all-jobs");
    const companyCollection = db.collection("all-companies");

    // getting all jobs
    app.get("/api/all-jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.json(result);
    });

    // getting the list of jobs by companies
    app.get("/api/jobs", async (req, res) => {
      const { companyId } = req.query;
      const result = await jobCollection.find({ companyId }).toArray();
      res.json(result);
    });

    // getting individual job details
    app.get("/api/jobs/:id", async (req, res) => {
      const { id } = req.params;
      const result = await jobCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    // getting company data for individual recruiter
    app.get("/api/company/self", async (req, res) => {
      const { recruiterId } = req.query;
      const result = await companyCollection.findOne({ recruiterId });
      res.json(result);
    });

    // posting a new job
    app.post("/api/jobs/new", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.json(result);
    });

    // creating a new company
    app.post("/api/companies/new", async (req, res) => {
      const newCompany = req.body;
      const result = await companyCollection.insertOne(newCompany);
      res.json(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server flying on port ${port}`);
});
