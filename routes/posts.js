const router = require("express").Router();
const Post = require("../models/Post");

//Create a post

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(403).json(err);
  }
});

//Update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(404).json("You can update only your post");
    }
  } catch (err) {
    res.status(403).json("Error occured");
  }
});

//Delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post._id && post._id == req.params.id) {
      const deletePOst = await Post.findByIdAndDelete(post._id);
      res.status(200).json(deletePOst);
    } else {
      res.status(404).json("Post not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Like a post

//Dislike a post

//Get a post


//Get timelines post

router.get("/timeline", async (req, res) => {
  let postArr = [];
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendsPosts = await Promise.all(
      currentUser.followings.msp((friendId) => {
        Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendsPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
