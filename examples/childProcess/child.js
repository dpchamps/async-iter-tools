setTimeout(() => {
    process.exit(0)
}, 5000);

setInterval(() => {
    process.send("Hello from cp")
}, 1000);

process.on("message", (message) => process.send(`echo: ${message}`));