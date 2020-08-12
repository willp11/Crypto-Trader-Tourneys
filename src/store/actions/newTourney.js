import * as actionTypes from './actionTypes';

export const updateProductList = (productList, exchange, oldList) => {
    let list = {...oldList};
    list[exchange] = productList;
    
    return {
        type: actionTypes.UPDATE_PRODUCT_LIST,
        productList: list
    }
};