const Home = require('../models/Home');
const axios = require('axios');
const redisClient = require('../redis-server');


//Get all genres

const getAllHome = async (req, res) => {
    try {
        const home = await Home.find();
        res.json({ home: home[1] });
    } catch (err) {
        res.json({ message: err });
    }
}

const getAllHomeV2 = async (req, res) => {
    try {
        const home = await Home.find();
        res.json(home);
    } catch (err) {
        res.json({ message: err });
    }
}






//Get a specific genre

const getSpecificHome = async (req, res) => {
    let newData = [];


    const cacheId = req.params.homeId + '/' + req.params.cn;
    let results;
    let isCached = false;

    try {
        const cacheResults = await redisClient.get(cacheId);
        if (cacheResults) {
            isCached = true;
            results = JSON.parse(cacheResults);
            results.home["isCached"] = true

            res.json(results);
        } else {

            if (req.params.cn) {
                const home = await Home.findById(req.params.homeId);
                //const size = home.homeData.count();
                const size = home.homeData.length
                //create a loop of home.homeData then fetch each data
                for (let i = 0; i < size; i++) {

                    const objectIds = home.homeData[i].data

                    if (home.homeData[i].type == "ImageSlider") {
                        const resp = await axios.get(`${process.env.BASE_URL}/api/slider/${home.homeData[i].data}`);
                        const datas = resp.data;
                        newData.push({
                            id: 1,
                            name: 'Slider',
                            type: 'ImageSlider',
                            items: 'slider',
                            data: datas,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui ? home.homeData[i].ui : null
                        })
                    }

                    if (home.homeData[i].type == "SingleSeries") {
                        const [sId, sPlatform] = home.homeData[i].data.split(":");
                        if (home.homeData[i].data.includes(":")) {


                            const resp = await axios.get(`${process.env.BASE_URL}/api/${sPlatform}/${sId}`);
                            const datas = resp.data;
                            newData.push({
                                id: 1,
                                name: home.homeData[i].name ? home.homeData[i].name : "Single Series /NA",
                                type: 'SingleSeries',
                                items: sPlatform,
                                data: datas,
                                chosen: false,
                                selected: false,
                                ui: home.homeData[i].ui ? home.homeData[i].ui : null
                            })
                        } else {
                            const resp = await axios.get(`${process.env.BASE_URL}/api/yt/${sId}`);
                            const datas = resp.data;
                            newData.push({
                                id: 1,
                                name: home.homeData[i].name ? home.homeData[i].name : "Single Series /NA",
                                type: 'SingleSeries',
                                items: 'singleSeries',
                                data: datas,
                                chosen: false,
                                selected: false,
                                ui: home.homeData[i].ui ? home.homeData[i].ui : null
                            })
                        }

                    }
                    if (home.homeData[i].type == "Category") {

                        const resp = await axios.get(`${process.env.BASE_URL}/api/series/byCatID/pg/${home.homeData[i].data}/${req.params.cn}`);

                        // const url = (req.params.homeId === "669f5e353fe1bf91a6a4e273" || req.params.homeId === "67600becc8c316e82cda17f6" || req.params.homeId === "676e9ed29984f81b9ecab6ff") 
                        //             ? `${process.env.BASE_URL}/api/series/byCatID/pg/${home.homeData[i].data}/${req.params.cn}` 
                        //             : `${process.env.BASE_URL}/api/series/byCatID/${home.homeData[i].data}/${req.params.cn}`;
                        // const resp = await axios.get(url);
                        const datas = resp.data;

                        // Try to delete pagination
                        try {
                            delete datas.pagination;
                        } catch (error) {
                            console.warn("Pagination property does not exist or could not be deleted:", error.message);
                        }

                        if (datas.series && datas.series.length > 0) {
                            newData.push({
                                id: 1,
                                name: home.homeData[i].name,
                                type: 'Category',
                                items: 'category',
                                data: datas,
                                chosen: false,
                                selected: false,
                                ui: home.homeData[i].ui ? home.homeData[i].ui : null
                            })
                        }
                    }
                    if (home.homeData[i].type == "PromotionalBanner") {
                        const resp = await axios.get(`${process.env.BASE_URL}/api/pb/${home.homeData[i].data}`);
                        const datas = resp.data;
                        newData.push({
                            id: 1,
                            name: 'Promotional Banner',
                            type: 'PromotionalBanner',
                            items: 'promotionalBanner',
                            data: datas.promotionalBanner,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui ? home.homeData[i].ui : null
                        })
                    }
                    if (home.homeData[i].type == "DisplayAd") {
                        let datas = null;
                        try {
                            const resp = await axios.get(`${process.env.BASE_URL}/api/dads/${home.homeData[i].data}`);
                            datas = resp.data;
                        } catch (error) {
                            datas = null;
                        }

                        newData.push({
                            id: 1,
                            name: datas?.title || null,
                            type: 'DisplayAd',
                            items: 'Advertisment',
                            tag: datas?.adUnit || null,
                            chosen: false,
                            selected: false,
                            ui: datas?.size || null
                        })
                    }
                    if (home.homeData[i].type == "SeriesByGenres") {

                        newData.push({
                            id: 1,
                            name: home.homeData[i].name,
                            type: 'SeriesByGenres',
                            data: null,
                            items: home.homeData[i].data || null,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui || null
                        })
                    }
                    if (home.homeData[i].type == "continueWatching") {

                        newData.push({
                            id: 1,
                            name: home.homeData[i].name,
                            type: 'continueWatching',
                            data: home.homeData[i].data || null,
                            items: home.homeData[i].data || null,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui || null
                        })
                    }
                }
                const finalData = {
                    home: {
                        _id: home._id,
                        homeTitle: home.homeTitle,
                        homeAppId: home.homeAppId,
                        homeData: newData,
                        isCached: isCached
                    }
                };

                await redisClient.set(cacheId, JSON.stringify(finalData));
                res.json(finalData);
            } else {

                const home = await Home.findById(req.params.homeId);
                //const size = home.homeData.count();
                const size = home.homeData.length
                //create a loop of home.homeData then fetch each data
                for (let i = 0; i < size; i++) {

                    const objectIds = home.homeData[i].data

                    if (home.homeData[i].type == "ImageSlider") {
                        const resp = await axios.get(`${process.env.BASE_URL}/api/slider/${home.homeData[i].data}`);
                        const datas = resp.data;
                        newData.push({
                            id: 1,
                            name: 'Slider',
                            type: 'ImageSlider',
                            items: 'slider',
                            data: datas,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui ? home.homeData[i].ui : null
                        })
                    }
                    // if (home.homeData[i].type == "SingleSeries") {
                    //     const resp = await axios.get(`${process.env.BASE_URL}/api/yt/${home.homeData[i].data}`);
                    //     const datas = resp.data;
                    //     newData.push({
                    //         id: 1,
                    //         name: 'Single Series',
                    //         type: 'SingleSeries',
                    //         items: datas?.episode?.length,
                    //         data: datas,
                    //         chosen: false,
                    //         selected: false,
                    //         ui: home.homeData[i].ui ? home.homeData[i].ui : null
                    //     })
                    // }

                    if (home.homeData[i].type == "SingleSeries") {

                        const [sId, sPlatform] = home.homeData[i].data.split(":");
                        if (home.homeData[i].data.includes(":")) {
                            const resp = await axios.get(`${process.env.BASE_URL}/api/${sPlatform}/${sId}`);;
                            const datas = resp.data;
                            newData.push({
                                id: 1,
                                name: home.homeData[i].name ? home.homeData[i].name : "Single Series /NA",
                                type: 'SingleSeries',
                                items: sPlatform,
                                data: datas,
                                chosen: false,
                                selected: false,
                                ui: home.homeData[i].ui ? home.homeData[i].ui : null
                            })

                        } else {
                            const resp = await axios.get(`${process.env.BASE_URL}/api/yt/${sId}`);;
                            const datas = resp.data;
                            newData.push({
                                id: 1,
                                name: home.homeData[i].name ? home.homeData[i].name : "Single Series /NA",
                                type: 'SingleSeries',
                                items: 'singleSeries',
                                data: datas,
                                chosen: false,
                                selected: false,
                                ui: home.homeData[i].ui ? home.homeData[i].ui : null
                            })
                        }

                    }

                    if (home.homeData[i].type == "Category") {
                        const resp = await axios.get(`${process.env.BASE_URL}/api/series/byCatID/pg/${home.homeData[i].data}/PK`);

                        // const url = (req.params.homeId === "669f5e353fe1bf91a6a4e273" || req.params.homeId === "67600becc8c316e82cda17f6" || req.params.homeId === "676e9ed29984f81b9ecab6ff") 
                        //             ? `${process.env.BASE_URL}/api/series/byCatID/pg/${home.homeData[i].data}/${req.params.cn}` 
                        //             : `${process.env.BASE_URL}/api/series/byCatID/${home.homeData[i].data}/${req.params.cn}`;
                        // const resp = await axios.get(url);
                        const datas = resp.data;
                        // Try to delete pagination
                        try {
                            delete datas.pagination;
                        } catch (error) {
                            console.warn("Pagination property does not exist or could not be deleted:", error.message);
                        }

                        newData.push({
                            id: 1,
                            name: home.homeData[i].name,
                            type: 'Category',
                            items: 'category',
                            data: datas,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui ? home.homeData[i].ui : null
                        })
                    }
                    if (home.homeData[i].type == "PromotionalBanner") {
                        const resp = await axios.get(`${process.env.BASE_URL}/api/pb/${home.homeData[i].data}`);
                        const datas = resp.data;
                        newData.push({
                            id: 1,
                            name: 'Promotional Banner',
                            type: 'PromotionalBanner',
                            items: 'promotionalBanner',
                            data: datas.promotionalBanner,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui ? home.homeData[i].ui : null
                        })
                    }
                    if (home.homeData[i].type == "DisplayAd") {
                        let datas = null;
                        try {
                            const resp = await axios.get(`${process.env.BASE_URL}/api/dads/${home.homeData[i].data}`);
                            datas = resp.data;
                        } catch (error) {
                            datas = null;
                        }

                        newData.push({
                            id: 1,
                            name: datas?.title || null,
                            type: 'DisplayAd',
                            items: 'Advertisment',
                            tag: datas?.adUnit || null,
                            chosen: false,
                            selected: false,
                            ui: datas?.size || null
                        })
                    }
                    if (home.homeData[i].type == "SeriesByGenres") {

                        newData.push({
                            id: 1,
                            name: home.homeData[i].name,
                            type: 'SeriesByGenres',
                            items: null,
                            data: home.homeData[i].data || null,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui || null
                        })
                    }
                    if (home.homeData[i].type == "continueWatching") {

                        newData.push({
                            id: 1,
                            name: home.homeData[i].name,
                            type: 'continueWatching',
                            data: home.homeData[i].data || null,
                            items: home.homeData[i].data || null,
                            chosen: false,
                            selected: false,
                            ui: home.homeData[i].ui || null
                        })
                    }
                }
                const finalData = {
                    home: {
                        _id: home._id,
                        homeTitle: home.homeTitle,
                        homeAppId: home.homeAppId,
                        homeData: newData,
                        isCached: isCached
                    }
                };

                await redisClient.set(cacheId, JSON.stringify(finalData));
                res.json(finalData);

            }

        }


    } catch (err) {
        res.json({ message: err });
    }
};



//Create a new genre

const createHome = async (req, res) => {

    const home = new Home({
        homeTitle: req.body.homeTitle,
        homeAppId: req.body.homeAppId,
        homeData: req.body.homeData
    });

    try {
        const savedhome = await home.save();
        res.json(savedhome);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updateHome = async (req, res) => {

    try {

        const updatedhome = await Home.updateOne(
            { _id: req.params.homeId },
            {
                $set: {
                    homeTitle: req.body.homeTitle,
                    homeAppId: req.body.homeAppId,
                    homeData: req.body.homeData
                },
            }
        );
        res.json(updatedhome);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deleteHome = async (req, res) => {
    try {
        const removedhome = await Home.deleteOne({ _id: req.params.homeId });
        res.json(removedhome);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllHome,
    getSpecificHome,
    createHome,
    updateHome,
    deleteHome,
    getAllHomeV2
};