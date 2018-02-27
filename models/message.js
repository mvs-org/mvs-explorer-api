module.exports = (success, message, data) => {
    return {
        status: {
            success: success,
            message: message
        },
        result: data
    };
};
