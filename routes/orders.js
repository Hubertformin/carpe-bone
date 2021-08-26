const express = require('express');
const router = express.Router();
const Orders = require('../models/orders');
const Reports = require('../models/reports');
const Functions = require('../utils/functions');


/* GET payloads listing. */
router.get('/', async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const startIndex = (page - 1) * limit;

        // Return orders by date Id == current by default
        const dateId = Functions.generateDateId();
        // get payloads from db
        const payloads = await Orders.find({dateId}).sort({'createdAt': 'desc'}).limit(limit).skip(startIndex);
        // count docs for pagintion
        const count = await Orders.find({dateId}).count();
        // send to front end
        res.status(200).json({data: payloads, count});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/date-id/:dateId', async (req, res, next) => {
    try {
        // get payloads from db
        const payloads = await Orders.findOne({dateId: req.params.dateId});
        // send to front end
        res.status(200).json({data: payloads});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/date-range/:start/:end', async (req, res, next) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const startIndex = (page - 1) * limit;

    try {
        // get payloads from db
        const payloads = await Orders.find({
            createdAt: { $gte: req.params.start, $lte: req.params.end }
        }).sort({'createdAt': 'desc'}).limit(limit).skip(startIndex);
        // count documents
        const count = await Orders.find({
            createdAt: { $gte: req.params.start, $lte: req.params.end }
        }).count();
        // send to front end
        res.status(200).json({data: payloads, count});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/all', async (req, res, next) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const startIndex = (page - 1) * limit;

    try {
        // get payloads from db
        const payloads = await Orders.find().sort({'createdAt': 'desc'}).limit(limit).skip(startIndex);
        // count docs for pagintion
        const count = await Orders.find().count();
        // send to front end
        res.status(200).json({data: payloads, count});
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/get/:id', async (req, res, next) => {
    try {
        // get payloads from db
        const payload = await Orders.find({ _id: req.params.id});
        // send to front end
        res.status(200).json({data: payload})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.get('/invoice-number', async (req, res, next) => {
    try {
        // date Id
        const dateId = Functions.generateDateId();
        const payload = await Reports.findOne({ date: dateId});
        // is date id exist
        if (payload) {
            const inv = Functions.generateInvoinceNumber(payload.numberOfOders + 1);
            res.status(200).json({data: inv});
        } else {
            const inv = Functions.generateInvoinceNumber();
            res.status(200).json({data: inv});
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

router.post('/', async (req, res, next) => {
    try {
        // generate date Id
        const dateId = Functions.generateDateId();
        // get payloads from db
        const payload = new Orders({...req.body, dateId});
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
        await Orders.updateOne({_id: req.params.id}, req.body);
        // send to front end
        res.status(200).json({message: "Orders updated"});
    } catch (e) {
        console.log(e);
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
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});


module.exports = router;
