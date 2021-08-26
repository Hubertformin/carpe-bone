const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory');

/* GET payloads listing. */
router.get('/', async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 15;

        const startIndex = (page - 1) * limit;
        // get payloads from db
        const payloads = await Inventory.find().limit(limit).skip(startIndex);
        // get items count
        const count = await Inventory.count();
        // send to front end
        res.status(200).json({data: payloads, count});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = await Inventory.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/search', async (req, res, next) => {
    const query = req.query.q;
    try {
        // get payloads from db
        const payload = await Inventory.find({ name: {$regex: `^((?!${query}).)*$`, $options: 'i'}});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/', async (req, res, next) => {
    // console.log(req.body);
    try {
        // get payloads from db
        const payload = new Inventory(req.body);
        // save the payload
        const _payload = await payload.save();
        // send to front end
        res.status(200).json({data: _payload})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        // update payload
        await Inventory.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "Inventory updated"});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        // get payloads from db
        await Inventory.deleteOne({ _id: req.params.id});
        // send to front end
        res.status(200).json({message: "Inventory deleted"})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

// delete many
router.post('/delete', async (req, res, next) => {
    try {
        // get ids from req body
        const ids = req.body.ids;
        // delete many
        await Inventory.deleteMany({_id:{$in:ids}})
        // send to front end
        res.status(200).json({data: {}, message: 'Deleted all'})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});



module.exports = router;
