function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}

function isValidMoney(amount) {
    return (
        Number.isFinite(amount) &&
        amount > 0 &&
        roundMoney(amount) === amount
    );
}

module.exports = {
    roundMoney,
    isValidMoney
};
