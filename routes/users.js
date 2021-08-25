const express = require('express');
const router = express.Router();
const User = require('../models/users');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    // get users from db
    const users = await User.find();
    // send to front end
    res.status(200).json({data: users, count: users.length});
  } catch (e) {
    res.status(500).json({errorText: e.toString()})
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    // get users from db
    const user = await User.find({ _id: req.params.id});
    // send to front end
    res.status(200).json({data: user})
  } catch (e) {
    res.status(500).json({errorText: e.toString()})
  }
});

router.post('/', async (req, res, next) => {
  try {
    // get users from db
    const user = new User(req.body);
    // save the user
    const _user = await user.save();
    // send to front end
    res.status(200).json({data: _user})
  } catch (e) {
    res.status(500).json({errorText: e.toString()})
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    // update user
    await User.updateOne({_id: req.params.id}, req.body);
    // send to front end
    res.status(200).json({message: "User updated"});
  } catch (e) {
    res.status(500).json({errorText: e.toString()})
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    // get users from db
    await User.deleteOne({ _id: req.params.id});
    // send to front end
    res.status(200).json({message: "User deleted"})
  } catch (e) {
    res.status(500).json({errorText: e.toString()})
  }
});



module.exports = router;
