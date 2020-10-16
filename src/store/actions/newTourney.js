import * as actionTypes from './actionTypes';

export const updateProductList = (productList, exchange, oldList, productType) => {
    let list = {...oldList};
    list[exchange][productType] = productList;
    
    return {
        type: actionTypes.UPDATE_PRODUCT_LIST,
        productList: list
    }
};

export const emptyProductList = () => {
    return {
        type: actionTypes.EMPTY_PRODUCT_LIST,
        productList: {'FTX': {'spot': [], 'future': []}}
    }
}