module.exports = {
    version: version
};

function version() {
    return Promise.resolve({
        current: "0.8.2",
        support: "0.8.0"
    });
}
