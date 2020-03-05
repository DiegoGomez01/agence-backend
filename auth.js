function returnMessage(res, code, header, message) {
    console.log(code);
    res.status(code).send({
        [header]: message
    });
}

module.exports = {
    returnMessage: returnMessage
};