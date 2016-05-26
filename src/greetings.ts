class Greetings {
    constructor(public name: string) { }
    hello() {
        return "hello " + this.name;
    }
};

var g = new Greetings("world");

document.body.innerHTML = g.hello();