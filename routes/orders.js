const express = require('express');
const router = express.Router();
const Orders = require('../models/orders');

/* GET payloads listing. */
router.get('/', async (req, res, next) => {
    try {
        // get payloads from db
        const payloads = await Orders.find();
        // send to front end
        res.status(200).json({data: payloads, count: payloads.length});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = await Orders.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = new Orders(req.body);
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
        await Orders.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "Orders updated"});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        // get payloads from db
        await Orders.deleteOne({ _id: req.params.id});
        // send to front end
        res.status(200).json({message: "Orders deleted"})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

module.exports = router;
