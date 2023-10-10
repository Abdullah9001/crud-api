const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

const getMongoConnection = async () => {
  const client = new MongoClient(
    "mongodb+srv://test123:test123@cluster0.3zj0x.mongodb.net/?retryWrites=true&w=majority"
  );
  await client.connect();
  const db = client.db("posts-management");
  return { client, db };
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.get("/api/v1/posts", async (req, res) => {
  const { client, db } = await getMongoConnection();
  try {
    const posts = await db.collection("posts").find({}).toArray();
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
});

app.get("/api/v1/posts/:postId", async (req, res) => {
  const { client, db } = await getMongoConnection();
  try {
    const postId = req.params.postId;
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    res.status(200).json({ success: true, data: post });

    if (!post) {
      res.status(404).json({ success: false, message: "No post found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
});

app.post("/api/v1/posts", async (req, res) => {
  const { client, db } = await getMongoConnection();
  try {
    const userData = req.body;
    const post = await db.collection("posts").insertOne(userData);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

app.delete("/api/v1/posts/:postId", async (req, res) => {
  const { client, db } = await getMongoConnection();
  try {
    const postId = req.params.postId;
    const post = await db
      .collection("posts")
      .deleteOne({ _id: new ObjectId(postId) });
    res.status(201).json({ success: true, data: post });

    if (!post) {
      res
        .sendStatus(404)
        .json({ success: false, data: { message: "No post found" } });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

app.put("/api/v1/posts/:postId", async (req, res) => {
  const { client, db } = await getMongoConnection();
  try {
    const postId = req.params.postId;
    const post = await db
      .collection("posts")
      .updateOne(
        { _id: new ObjectId(postId) },
        { $set: { title: req.body.title, description: req.body.description } }
      );

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
