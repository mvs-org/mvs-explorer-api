module.exports = {
    version: version
};

function version() {
    return Promise.resolve({
        current: "0.7.3",
        support: "0.0.1"
    });
}
