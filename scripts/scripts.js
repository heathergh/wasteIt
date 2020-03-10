const app = {};

app.imgurUrlAndQueryParams = "https://api.imgur.com/3/gallery/hot/time/0?&realtimeResults=false&showViral=true&album_previews=true";

app.imgurClientID = "3065d378db00228";

app.devTOUrl = "https://dev.to/api/articles";

app.nytObituariesUrl = "https://api.nytimes.com/svc/topstories/v2/obituaries.json?api-key=n8rVAT6WaMe5g4stcG6o9f8iOXimh5ec";

app.resultsContainer = document.querySelector(".results");

// global API call
app.getData = async (url, options = {}, filterData = null, displayData) => {
    return await fetch(url, options)
    .then(response => response.json())
    .then(result => {
        if (filterData === null) {
            displayData(result);
        } else if (!(filterData === null) && Array.isArray(result.data)) {
            const filteredResult = app.filterData(result.data);

            displayData(filteredResult);
        }
    })
    //TODO: show error message to user if API call fails
    .catch( error =>
        app.resultsContainer.insertAdjacentHTML("beforeend", "<p class=\"error\">Error: We couldn't get the content you requested. Please try again later.</p>")
    );
}

app.filterData = (result) => {
    return filteredData = result.filter(item => {
        if ((item.hasOwnProperty("images")) && (item.images[0].type.includes("video") || item.images[0].type.includes("image")) && !(item.images[0].animated)) {
            return true;
        }
    });
}

// Get Imgur response, and append each image to the page
app.displayImgurData = (apiResponseObjects) => {
    apiResponseObjects.forEach(responseObject => {
        const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        ${responseObject.title}
                    </h3>
                    <div class="item">
                        <a href=${responseObject.link}>
                        <img class="result-item" src=${"https://i.imgur.com/" + responseObject.images[0].id + "_d.jpg?maxwidth=300&shape=thumb&fidelity=high"} alt=${(responseObject.images[0]['description'] === null) ? "" : "\"" + responseObject.images[0]['description'] + "\""}>
                        </a>
                    </div>
                </div>
            `;

            app.resultsContainer.insertAdjacentHTML("beforeend", htmlToAppend);
    }) 
};

app.displayDevToData = (apiResponseObjects) => {
    apiResponseObjects.forEach(responseObject => {
        
        if (responseObject.hasOwnProperty('cover_image') && responseObject['cover_image'] !== null) {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        <a href=${responseObject.canonical_url}">${responseObject.title}</a>
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

            app.resultsContainer.insertAdjacentHTML("beforeend", htmlToAppend);
        } else {
            const htmlToAppend = `
                <div class="ui list segment">
                    <h3 class="ui header">
                        <a href=${responseObject.canonical_url}">${responseObject.title}</a>
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

            app.resultsContainer.insertAdjacentHTML("beforeend", htmlToAppend);
        }
    })
};

app.displayNytData = (apiResponseObjects) => {
    const responseObjects = apiResponseObjects.results;
    responseObjects.forEach(responseObject => {
        const htmlToAppend = `
            <div class="ui list segment">
                <h3 class="ui header">
                    <a href=${responseObject.url}">${responseObject.title}</a>
                </h3>
                <div class="item">
                    <div class="content">
                        <img class="result-item" src=${responseObject.multimedia[2].url}>
                        <p class="ui description">${responseObject.abstract}</h4>
                    </div>
                </div>
            </div>
        `;

        app.resultsContainer.insertAdjacentHTML("beforeend", htmlToAppend);
    });
};

app.callAPIOnClick = (selector, classToAdd, classToRemove) => {
    const selectedButton = document.querySelector(selector);
    
    selectedButton.addEventListener("click", () => {
        if (app.resultsContainer.children.length > 0) {
            app.resultsContainer.innerHTML = "";
        }

        if (selector === ".get-fun") {
            app.resultsContainer.classList.add(classToAdd);
            app.resultsContainer.classList.remove(...classToRemove);
            app.getData(app.imgurUrlAndQueryParams, {headers: {Authorization: `Client-ID ${app.imgurClientID}`}}, app.filterData, app.displayImgurData);
        }

        if (selector === ".get-learned-fun") {
            app.resultsContainer.classList.add(...classToAdd);
            app.resultsContainer.classList.remove(classToRemove); 
            app.getData(app.devTOUrl, {}, null, app.displayDevToData);
        }
        
        if (selector === ".no-fun") {
            app.resultsContainer.classList.add(...classToAdd);
            app.resultsContainer.classList.remove(classToRemove); 
            app.getData(app.nytObituariesUrl, {}, null, app.displayNytData);
        }
    });
};

// app.infiniteScroll = () => {
//     // TODO: Add infinite scrolling functionality
// }

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
