const { response } = require('express');
const YTEpisodeSchema = require('../models/YTEpisode');
const axios = require('axios');

function getPosts() {
    const response = fetch(`${process.env.BASE_URL}/api/series`);
    return response.json();
}

const getLoc = async (req, res) => {

    try {
        let data = 'PK';

        // Properly interpolate the cacheBuster value
        const cacheBuster = `deviceID=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

        // Correctly build the apiUrl string
        const apiUrl = `https://cdn.aryzap.com/api/geoCountry.php?${cacheBuster}`;

        // Make the request to fetch geoCountry info
        const response = await axios.get(apiUrl);
        if (response.data && response.data.country_code) {
            data = response.data.country_code;
        }
        // const resp = await axios.get(`https://1.1.1.1/cdn-cgi/trace`);
        // const data = resp.data;
        // const newArray = resp.data.match(/loc=(\S+)/)[1];



        res.json({ country: data });

    } catch (e) {
        res.json({ error: e.message });
    }

};

const postReg = async (req, res) => {

    const newData = [];
    const episodeData = [];
    const body = {
        Registration: {
            Currency: req.body.currency,
            ReturnPath: `${process.env.BASE_URL}/api/pay/callback`,
            TransactionHint: "CPT:Y;VCC:Y;",
            OrderID: req.body.orderId,
            Store: "0000",
            Terminal: "0000",
            Channel: "Web",
            Amount: req.body.packageAmount,
            Customer: req.body.customerName,
            OrderName: req.body.packageName,
            UserName: "Demo_fY9c",
            Password: "Comtrust@20182018"
        }
    };
    try {

        const resp = await axios.post(`https://demo-ipg.ctdev.comtrust.ae:2443`, body, {
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json'
            }
        });
        //const data = resp.data.items;

        // TODO: Create a For loop that will check if item etag is already exists or not if its not exists then it will create a new item

        //for (const item of data) {

        //const existingItem = await YTEpisodeSchema.findOne({ id: item.id });

        // if (!existingItem) {
        //      const seriesId = { seriesId: req.params.seriesId, videoSource: null }
        //Insert a new Item
        //    const newItem = await YTEpisodeSchema.create({ ...seriesId, ...item });
        //  console.log(`Inserted item with _id ${newItem._id}`);
        //} else {
        //   console.log(`Item with _id ${item.etag} already exists in the database.`);
        // }

        //newData.push(item);
        //}

        res.json({
            data: resp.data
        });

    } catch (e) {
        res.json({ errorPing: e.message });
    }

};

const getAllYTEpisodes = async (req, res) => {
    try {
        const episode = await YTEpisodeSchema.find();
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific episode

const getSpecificYTEpisode = async (req, res) => {

    try {
        const episode = await YTEpisodeSchema.findOne(req.params.episodeId);
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};

const getSpecificYTEpisodesBySeriesID = async (req, res) => {

    try {
        const episode = await YTEpisodeSchema.find({ seriesId: req.params.seriesId });
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new episode

const createYTEpisode = async (req, res) => {

    const episode = new YTEpisodeSchema({
        title: req.body.title,
        description: req.body.description,
        season: req.body.season,
        episode: req.body.episode,
        air_date: req.body.air_date,
        cast: req.body.cast,
        series: req.body.series,
        image: req.body.image,
        imageCover: req.body.imageCover,
        imagePortrait: req.body.imagePortrait,
        trailer: req.body.trailer,
        video: req.body.video,
    });

    try {
        const savedEpisode = await episode.save();
        res.json(savedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an episode

const updateYTEpisode = async (req, res) => {

    try {

        const updatedEpisode = await YTEpisodeSchema.updateOne(
            { _id: req.params.episodeId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    season: req.body.season,
                    episode: req.body.episode,
                    air_date: req.body.air_date,
                    cast: req.body.cast,
                    series: req.body.series,
                    image: req.body.image,
                    imageCover: req.body.imageCover,
                    imagePortrait: req.body.imagePortrait,
                    trailer: req.body.trailer,
                    video: req.body.video,
                },
            }
        );
        res.json(updatedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an episode

const deleteYTEpisode = async (req, res) => {
    try {
        const removedEpisode = await YTEpisodeSchema.deleteOne({ _id: req.params.episodeId });
        res.json(removedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    postReg
};