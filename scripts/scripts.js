const app = {};

app.imgurUrlAndQueryParams = "https://api.imgur.com/3/gallery/hot/time/0?&realtimeResults=false&showViral=true&album_previews=true";

app.imgurClientID = "3065d378db00228";

app.devTOAccessToken = "4aFRPxQCcxSuTwgim3nQJaku";

app.devTOBaseUrl = "https://dev.to/api";

app.nytObituariesUrl = "https://api.nytimes.com/svc/topstories/v2/obituaries.json?api-key=n8rVAT6WaMe5g4stcG6o9f8iOXimh5ec";

app.resultsList = document.querySelector(".results");


// Imgur API call
app.getImgurData = async (url, options = {}) => {
    await fetch(app.imgurUrlAndQueryParams, {
        method: 'GET',
        headers: {
            Authorization: `Client-ID ${app.imgurClientID}`
        }
    })
    .then(response => response.json())
    .then(result => {
        const filteredResult = app.filterImgurData(result.data);

        app.displayImgurData(filteredResult);
    })
    .catch(error => console.error(`uh-oh, something went wrong with the Imgur API call: ${error}`));
};

app.filterImgurData = (result) => {
    return result.filter(item => {
        if ((item.hasOwnProperty("images")) && (item.images[0].type === "video/mp4" || item.images[0].type === "image/jpeg" || item.images[0].type === "image/png")) {
            return true;
        }
    });
}

// DevTO API call
app.getDevToData = async () => {
    await fetch(`${app.devTOBaseUrl}/articles`)
    .then(response => response.json())
    .then(result => {
        app.displayDevToData(result)
    })
    .catch(error => {
        console.error(`uh-oh, something went wrong with the DevTO API call: ${error}`);
    });
}

// NYT API call to get obituaries section
app.getNYTData = async () => {
    await fetch(`${app.nytObituariesUrl}`)
    .then(response => response.json())
    .then(result => {

        app.displayNytData(result.results);
    })
    .catch(error => {
        console.error(`uh-oh, something went wrong with the NYT API call: ${error}`);
    });
}

// Get Imgur response, and append each image and video to the page
app.displayImgurData = (apiResponseObjects) => {
    apiResponseObjects.forEach(responseObject => {
        if (Array.isArray(responseObject.images) && !responseObject.images[0].animated) {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        ${responseObject.title}
                    </h3>
                    <div class="item">
                        <a href=${responseObject.link} target="_blank">
                            <img class="result-item" src=${responseObject.images[0].link}>
                        </a>
                    </div>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        }

        if (Array.isArray(responseObject.images) && responseObject.images[0].type === "video/mp4") {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        ${responseObject.title}
                    </h3>
                    <div class="item">
                        <a href=${responseObject.link} target="_blank">
                            <video class="result-item ui" preload="auto" autoplay="autoplay" muted="muted" loop="loop" webkit-playsinline="" poster=${responseObject.images[0].gifv}>
                                <source type=${responseObject.images[0].type} src=${responseObject.images[0].link}>
                            </video>
                        </a>
                    </div>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        }

    }) 
};

app.displayDevToData = (apiResponseObjects) => {
    apiResponseObjects.forEach(responseObject => {
        
        if (responseObject.cover_image !== null) {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        <a href=${responseObject.canonical_url} target="_blank">${responseObject.title}</a>
                    </h3>
                    <div class="item">
                        <img class="ui avatar image" src=${responseObject.user.profile_image_90}>
                        <div class="content">
                            <h4 class="header">By ${responseObject.user.name}</h4>
                        </div>
                    </div>
                    <img class="result-item" src=${responseObject.cover_image}>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        } else {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        <a href=${responseObject.canonical_url} target="_blank">${responseObject.title}</a>
                    </h3>
                    <div class="item">
                        <img class="ui avatar image" src=${responseObject.user.profile_image_90}>
                        <div class="content">
                            <h4 class="header">By ${responseObject.user.name}</h4>
                        </div>
                    </div>
                    <p>${responseObject.description}</p>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        }
    })
};

app.displayNytData = (apiResponseObjects) => {
    apiResponseObjects.forEach(responseObject => {
        const htmlToAppend = `
            <div class="ui list segment">
                <h3 class="ui header">
                    <a href=${responseObject.url} target="_blank">${responseObject.title}</a>
                </h3>
                <div class="item">
                    <div class="content">
                        <img class="result-item" src=${responseObject.multimedia[1].url}>
                        <p class="ui description">${responseObject.abstract}</h4>
                    </div>
                </div>
            </div>
        `;

        app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
    });
};

app.callAPIOnClick = (selector, classToAdd, classToRemove) => {
    const selectedButton = document.querySelector(selector);
    
    selectedButton.addEventListener("click", () => {
        if (app.resultsList.children.length > 0) {
            app.resultsList.innerHTML = "";
        }
        if (selector === ".get-fun") {
            app.resultsList.classList.add(classToAdd);
            app.resultsList.classList.remove(...classToRemove);
            app.getImgurData();
        }

        if (selector === ".get-learned-fun") {
            app.resultsList.classList.add(...classToAdd);
            app.resultsList.classList.remove(classToRemove); 
            app.getDevToData();
        }
        
        if (selector === ".no-fun") {
            app.resultsList.classList.add(...classToAdd);
            app.resultsList.classList.remove(classToRemove); 
            app.getNYTData();
        }
    });
};

app.init = () => {
    app.callAPIOnClick(".get-fun", "imgur", ["results-list", "ui", "grid", "container", "center", "aligned"]);
    app.callAPIOnClick(".get-learned-fun", ["results-list", "ui", "grid", "container", "center", "aligned"], "imgur");
    app.callAPIOnClick(".no-fun", ["results-list", "ui", "grid", "container", "center", "aligned"], "imgur");
};

if (document.readyState === "complete") {
	app.init();
} else {
	document.addEventListener("DOMContentLoaded", app.init);
};
