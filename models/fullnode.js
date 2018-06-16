module.exports = {
    version: version
};

function version() {
    return Promise.resolve({
        current: "0.8.0",
        support: "0.8.0"
    });
}
