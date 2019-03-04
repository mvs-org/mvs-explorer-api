module.exports = {
    version: version
};

function version() {
    return Promise.resolve({
        current: "0.9.0",
        support: "0.9.0"
    });
}
