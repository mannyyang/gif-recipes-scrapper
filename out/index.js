"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const osmosis = require("osmosis");
const axios_1 = require("axios");
let previousData = {
    id: '',
    author: '',
    link: '',
    linkType: '',
    comments: [],
    createdAt: new Date(),
    isProcessed: false,
    permalink: '',
    source: 'reddit'
};
osmosis
    .get('https://old.reddit.com/r/GifRecipes/')
    .paginate('.nav-buttons .next-button a', 800)
    .find('.thing.link')
    .set({
    id: '@data-fullname',
    reddit_id: '@data-fullname',
    title: '.title a',
    author: '@data-author',
    description: '@data-context',
    srcLink: '@data-url',
    link: '@data-url',
    linkType: '@data-domain',
    timeStamp: '@data-timestamp',
    permalink: '@data-permalink'
})
    .follow('.entry .flat-list a.comments@href')
    .find('.comment')
    .set({
    comments: [{
            author: '.entry a.author',
            comment: '.entry .usertext-body'
        }]
})
    .data(function (listing) {
    //console.log(listing)
    if (!previousData) {
        previousData = Object.assign({}, previousData, listing);
    }
    else if (previousData.id === listing.id) {
        previousData.comments = previousData.comments.concat(listing.comments);
    }
    else {
        if (['t3_5s58rb', 't3_6dz9qm', 't3_62puv2', 't3_5pbacr'].indexOf(previousData.id) < 0 && ['i.redd.it', 'self.GifRecipes'].indexOf(previousData.linkType) < 0) {
            let recipe = "";
            for (let i = 0; i < previousData.comments.length; i++) {
                if ((previousData.comments[i].comment.search(/ingredients/i) > -1)
                    && (previousData.comments[i].author === previousData.author)) {
                    recipe = previousData.comments[i].comment;
                }
            }
            previousData.link = updateVideoSrc(previousData.link);
            previousData.createdAt = new Date();
            console.log(previousData);
            axios_1.default.post('http://localhost:1337/recipe', Object.assign({}, previousData, { recipe: recipe }))
                .then(res => {
                // console.log(res);
                console.log("succes");
            });
            // ESClient.index({
            // 	// opType: 'index',
            // 	index: 'recipes',
            // 	id: previousData.id,
            // 	body: {
            // 		type: 'raw',
            // 		...previousData,
            // 		recipe: recipe
            // 	}
            // });
        }
        previousData = listing;
    }
});
function updateVideoSrc(value) {
    if (isImgurSrc(value)) {
        return value.replace('.gifv', '.mp4');
    }
    else if (isGfySrc('gfycat.com')) {
        if (value.indexOf('.mp4') >= 0) {
            return value;
        }
        else {
            return value.replace('gfycat.', 'giant.gfycat.') + '.mp4';
        }
    }
    else {
        return value;
    }
}
function isImgurSrc(url) {
    return url.indexOf('i.imgur.com') >= 0;
}
function isGfySrc(url) {
    return url.indexOf('gfycat.com') >= 0;
}
//# sourceMappingURL=index.js.map