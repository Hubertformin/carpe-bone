const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory');

/* GET payloads listing. */
router.get('/', async (req, res, next) => {
    try {
        // get payloads from db
        const payloads = await Inventory.find();
        // send to front end
        res.status(200).json({data: payloads, count: payloads.length});
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
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = new Inventory(req.body);
        // save the payload
        const _payload = await payload.save();
        // send to front end
        res.status(200).json({data: _payload})
    } catch (e) {
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
        res.status(500).json({errorText: e.toString()})
    }
});



module.exports = router;
