export function getMasterChefABI(): JSON{
    var masterchef = require('./masterchef.json');
    return masterchef;
}

export function getERC20ABI(): JSON {
    var erc20 = require('./erc20.json');
    return erc20;
}
