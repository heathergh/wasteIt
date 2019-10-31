const app = {};

app.imgurBaseUrl = "https://api.imgur.com/3/gallery";
app.imgurAccessToken = "3506304d211eee291575dd76d088ddb53f56f638";

app.devTOAccessToken = "4aFRPxQCcxSuTwgim3nQJaku";
app.devTOBaseUrl = "https://dev.to/api";

app.nytObituariesUrl = "https://api.nytimes.com/svc/topstories/v2/obituaries.json?api-key=n8rVAT6WaMe5g4stcG6o9f8iOXimh5ec";

app.resultsList = document.querySelector(".results");


// Imgur API call
app.getImgurResults = async () => {
    try {
        const imgurRequest = await fetch(`https://api.imgur.com/3/gallery/hot/time/0?&realtimeResults=false&showViral=true&album_previews=true`, {
            headers: {
                Authorization: `Bearer ${app.imgurAccessToken}`
            }
        });
        const imgurResponse = await imgurRequest.json();
        const imgurMediaArray = imgurResponse.data;
        
        const imgurTitle = imgurMediaArray.map(item => {
            return item.title;
        });

        const imgurResponseArray = imgurMediaArray.map(item => {
            if (item.hasOwnProperty("images")) {
                return item;
            }
        });
        
        const filteredArr = imgurResponseArray.filter(item => {
            if (item && (item.images[0].type === "video/mp4" || item.images[0].type === "image/jpeg" || item.images[0].type === "image/png")) {
                return true;
            }
        });

        app.showImgurResults(filteredArr);

    } catch (error) {
        console.error(`uh-oh, something went wrong with the Imgur API call: ${error}`);
    }
};

// DevTO API call
app.getDevToArticles = async () => {
    try {
        const devToRequest = await fetch(`${app.devTOBaseUrl}/articles`);
        const devToJsonResponse = await devToRequest.json();

        app.showDevToResults(devToJsonResponse);
    } catch (error) {
        console.error(`uh-oh, something went wrong with the DevTO API call: ${error}`);
    }
}

// NYT API call to get obituaries section
app.getNYTObituaries = async () => {
    try {
        const nytRequest = await fetch(`${app.nytObituariesUrl}`);
        const nytJsonResponse = await nytRequest.json();

        app.showNytResults(nytJsonResponse.results);
    } catch (error) {
        console.error(`uh-oh, something went wrong with the NYT API call: ${error}`);
    }
}

// Get Imgur response, and append each image and video to the page
app.showImgurResults = (responseObjs) => {
    responseObjs.forEach(responseObj => {
        if (responseObj.images[0].animated === false) {
            const htmlToAppend = `
                <div>
                    <h3 class="ui header">
                        ${responseObj.title}
                    </h3>
                    <a href=${responseObj.link} target="_blank">
                        <img class="result-item" src=${responseObj.images[0].link}>
                    </a>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        }

        if (responseObj.type === "video/mp4") {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        ${responseObj.title}
                    </h3>
                    <div class="item">
                        <a href=${responseObj.link} target="_blank">
                            <video class="result-item ui" preload="auto" autoplay="autoplay" muted="muted" loop="loop" webkit-playsinline="" poster=${responseObj.images[0].gifv}>
                                <source type=${responseObj.images[0].type} src=${responseObj.images[0].link}>
                            </video>
                        </a>
                    </div>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        }

    }) 
};

app.showDevToResults = (responseObjs) => {
    responseObjs.forEach(responseObj => {
        
        if (responseObj.cover_image !== null) {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        <a href=${responseObj.canonical_url} target="_blank">${responseObj.title}</a>
                    </h3>
                    <div class="item">
                        <img class="ui avatar image" src=${responseObj.user.profile_image_90}>
                        <div class="content">
                            <h4 class="header">By ${responseObj.user.name}</h4>
                        </div>
                    </div>
                    <img class="result-item" src=${responseObj.cover_image}>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        } else {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        <a href=${responseObj.canonical_url} target="_blank">${responseObj.title}</a>
                    </h3>
                    <div class="item">
                        <img class="ui avatar image" src=${responseObj.user.profile_image_90}>
                        <div class="content">
                            <h4 class="header">By ${responseObj.user.name}</h4>
                        </div>
                    </div>
                    <p>${responseObj.description}</p>
                </div>
            `;

            app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
        }

        
    })
};

app.showNytResults = (responseObjs) => {
    responseObjs.forEach(responseObj => {
        const htmlToAppend = `
            <div class="ui list segment">
                <h3 class="ui header">
                    <a href=${responseObj.url} target="_blank">${responseObj.title}</a>
                </h3>
                <div class="item">
                    <div class="content">
                        <img class="result-item" src=${responseObj.multimedia[1].url}>
                        <p class="ui description">${responseObj.abstract}</h4>
                    </div>
                </div>
            </div>
        `;

        app.resultsList.insertAdjacentHTML("beforeend", htmlToAppend);
    });
};

app.callApi = (selector, classToAdd, classToRemove) => {
    const selectedButton = document.querySelector(selector);
    
    selectedButton.addEventListener("click", () => {
        if (app.resultsList.children.length > 0) {
            app.resultsList.innerHTML = "";
        }

        if (selector === ".get-fun") {
            app.resultsList.classList.add(classToAdd);
            app.resultsList.classList.remove(...classToRemove);
            app.getImgurResults();
        }
        if (selector === ".get-learned-fun") {
            app.resultsList.classList.add(...classToAdd);
            app.resultsList.classList.remove(classToRemove); 
            app.getDevToArticles();  
        }
        if (selector === ".no-fun") {
            app.resultsList.classList.add(...classToAdd);
            app.resultsList.classList.remove(classToRemove); 
            app.getNYTObituaries();
        }
    });
};

app.init = () => {
    app.callApi(".get-fun", "imgur", ["results-list", "ui", "grid", "container", "center", "aligned"]);
    app.callApi(".get-learned-fun", ["results-list", "ui", "grid", "container", "center", "aligned"], "imgur");
    app.callApi(".no-fun", ["results-list", "ui", "grid", "container", "center", "aligned"], "imgur");
};

if (document.readyState === "complete") {
	app.init();
} else {
	document.addEventListener("DOMContentLoaded", app.init);
};

