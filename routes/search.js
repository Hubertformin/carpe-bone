const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory');

router.get('/inventory', async (req, res, next) => {
    const query = req.query.q;
    try {
        // get payloads from db
        const regEx = new RegExp(query, 'i');
        const payload = await Inventory.find({ name: {$regex: regEx}});
        // send to front end
        payload.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        res.status(200).json({data: payload})
    } catch (e) {
        console.log(e);
        res.status(500).json({errorText: e.toString()})
    }
});

module.exports = router;