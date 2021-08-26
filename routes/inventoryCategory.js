const express = require('express');
const router = express.Router();
const InventoryCategory = require('../models/inventoryCategory');

/* GET payloads listing. */
router.get('/', async (req, res, next) => {
    try {
        // get payloads from db
        const payloads = await InventoryCategory.find();
        // send to front end
        res.status(200).json({data: payloads, count: payloads.length});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = await InventoryCategory.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = new InventoryCategory(req.body);
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
        await InventoryCategory.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "InventoryCategory updated"});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        // get payloads from db
        await InventoryCategory.deleteOne({ _id: req.params.id});
        // send to front end
        res.status(200).json({message: "InventoryCategory deleted"})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});



module.exports = router;
