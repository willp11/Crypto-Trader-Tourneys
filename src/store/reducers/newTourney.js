import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../utility';

const initialState = {
    productList: {'FTX': {'spot': [], 'future': []}},
    loading: false,
    error: false,
};

const updateProductList = (state, action) => {
    return updateObject(state, {productList: action.productList});
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_PRODUCT_LIST: return updateProductList(state, action);
        default:
            return state;
    }
};

export default reducer;