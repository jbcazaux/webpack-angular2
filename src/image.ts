class MyImage {
    greenImageUrl = require("./green.png");
    displayUrl() {
        document.body.innerHTML = this.greenImageUrl;
    }
};

new MyImage().displayUrl();