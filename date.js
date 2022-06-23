//module.exports = <name of function> --- for default export
module.exports.getDate = getDate;

function getDate() {
    let todayData = new Date();
    let day = todayData.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
    return day;
}

//shorter
exports.getDay = () => {
    let todayData = new Date();
    return todayData.toLocaleDateString("en-US", {
        weekday: "long",
    });
}