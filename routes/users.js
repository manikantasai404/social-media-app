const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//Update user

router.put("/:id", async (req, res) => {
  if (req.body.userId == req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account updated successfuly");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can update only your account");
  }
});

//Delete user

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) res.status(404).json("User not found");
      else res.status(200).json("User deleted successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Error occured");
  }
});

//Get user

router.get("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) res.status(404).json("User not found");
      else {
        const { password, updatedAt, createdAt, ...other } = user._doc;
        res.status(200).json(other);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Error occured");
  }
});

//Follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.params.id != req.body.userId) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res
          .status(200)
          .json("User has bee follower and added to your followers");
      } else {
        res.status(500).json("You already follows the user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow your self");
  }
});

//Unfollow user

router.put("/:id/unfollow", async (req, res) => {
  if (req.params.id != req.body.userId) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("Unfollowed successfully");
      } else {
        res.status(500).json("You are not following this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow your self");
  }
});

module.exports = router;
