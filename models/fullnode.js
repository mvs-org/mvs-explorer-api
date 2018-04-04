module.exports = {
    version: version
};

function version() {
    return Promise.resolve({
        current: "0.7.5",
        support: "0.7.5"
    });
}
