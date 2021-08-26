function generateDateId() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function generateInvoinceNumber(num = 1) {
    const date= new Date(),
    year = date.getFullYear().toString().slice(2),
    month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1),
    day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    // case
    let numCount = num.toString().length, orderNumber;
    switch(numCount) {
        case 1:
        default:
            orderNumber = `000${num}`
            break;
        case 2:
            orderNumber = `00${num}`
            break;
        case 3:
            orderNumber = `0${num}`
            break;
        case 4:
            orderNumber = num
            break;
    }

    return `PO${year}${month}${day}${orderNumber}`
}

module.exports = {
    generateDateId,
    generateInvoinceNumber
}