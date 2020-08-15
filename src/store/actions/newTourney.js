import * as actionTypes from './actionTypes';

export const updateProductList = (productList, exchange, oldList, productType) => {
    let list = {...oldList};
    console.log(productType)
    list[exchange][productType] = productList;
    
    return {
        type: actionTypes.UPDATE_PRODUCT_LIST,
        productList: list
    }
};