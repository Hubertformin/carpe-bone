const express = require('express');
const router = express.Router();
const Reports = require('../models/reports');
const InventoryReports = require('../models/inventoryReports');
const CategoryReports = require('../models/categoryReport');

/* GET payload listing. */
router.get('/', async (req, res, next) => {
    try {
        // get payload from db
        const payload = await Reports.find();
        // send to front end
        res.status(200).json({data: payload, count: payload.length});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        // get payload from db
        const payload = await Reports.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/', async (req, res, next) => {
    try {
        // get payload from db
        const payload = new Reports(req.body);
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
        await Reports.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "Reports updated"});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        // get payload from db
        await Reports.deleteOne({ _id: req.params.id});
        // send to front end
        res.status(200).json({message: "Reports deleted"})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

/**
 *  Inventory reports
 * */
/* GET payload listing. */
router.get('/inventory', async (req, res, next) => {
    try {
        // get payload from db
        const payload = await InventoryReports.find();
        // send to front end
        res.status(200).json({data: payload, count: payload.length});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/inventory/:id', async (req, res, next) => {
    try {
        // get payload from db
        const payload = await InventoryReports.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/inventory', async (req, res, next) => {
    try {
        // get payload from db
        const payload = new InventoryReports(req.body);
        // save the payload
        const _payload = await payload.save();
        // send to front end
        res.status(200).json({data: _payload})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.put("/inventory/:id", async (req, res, next) => {
    try {
        // update payload
        await InventoryReports.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "InventoryReports updated"});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.delete('/inventory/:id', async (req, res, next) => {
    try {
        // get payload from db
        await InventoryReports.deleteOne({ _id: req.params.id});
        // send to front end
        res.status(200).json({message: "InventoryReports deleted"})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

/**
 *  Inventory category reports
 * */
/* GET payload listing. */
router.get('/inventory-category', async (req, res, next) => {
    try {
        // get payload from db
        const payload = await CategoryReports.find();
        // send to front end
        res.status(200).json({data: payload, count: payload.length});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/inventory-category/:id', async (req, res, next) => {
    try {
        // get payload from db
        const payload = await CategoryReports.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/inventory-category', async (req, res, next) => {
    try {
        // get payload from db
        const payload = new CategoryReports(req.body);
        // save the payload
        const _payload = await payload.save();
        // send to front end
        res.status(200).json({data: _payload})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.put("/inventory-category/:id", async (req, res, next) => {
    try {
        // update payload
        await CategoryReports.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "InventoryReports updated"});
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});

router.delete('/inventory-category/:id', async (req, res, next) => {
    try {
        // get payload from db
        await CategoryReports.deleteOne({ _id: req.params.id});
        // send to front end
        res.status(200).json({message: "InventoryReports deleted"})
    } catch (e) {
        res.status(500).json({errorText: e.toString()})
    }
});



module.exports = router;
