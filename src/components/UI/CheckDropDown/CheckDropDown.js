import React, {Component, createRef} from 'react';
import './CheckDropDown.css';
import {connect} from 'react-redux';
import * as actions from '../../../store/actions/index';

class CheckDropDown extends Component {
    
    state = {
        checkList: null,
        productsSelected: [],
        visibleProducts: []
    }

    componentDidMount() {
        let newRef = createRef();
        this.setState({
            checkList: newRef,
            visibleProducts: this.props.products
        });
    }

    componentDidUpdate() {
        //console.log(this.props.productList);
    }

    selectHandler = () => {
        
        if (this.state.checkList.current.classList.contains('visible')) {
            this.state.checkList.current.classList.remove('visible'); 
        } else {
            this.state.checkList.current.classList.add('visible'); 
        }
    };

    checkboxHandler = (event, inputItem, index, exchange, productType) => {
        
        let newProducts = [...this.props.productList[exchange][productType]];

        if (event.target.checked) {
            newProducts.push(inputItem);
        } else {
            let indexToRemove = newProducts.indexOf(inputItem);
            newProducts.splice(indexToRemove, 1);
        }
        
        this.setState({
            productsSelected: newProducts
        });
        
        this.props.updateProductList(newProducts, this.props.exchange, this.props.productList, this.props.productType);
    }
    
    searchProductsHandler = (event) => {
        let searchTerm = event.target.value;
        
        if (searchTerm != '') {
            // update the visible products array with any products that match the search term
            if (this.props.products.includes(searchTerm)) {
                this.setState({visibleProducts: [searchTerm]});
            } else {
                this.setState({visibleProducts: []});
            }
        } else {
            this.setState({visibleProducts: this.props.products});
        }

    }
    
    render() {
        let list = null;
        let searchInput = null;
        if (this.state.visibleProducts) {
            list = this.state.visibleProducts.map((inputItem, index) => {
                let checked = false;
                let exchange = this.props.exchange;
                let productType = this.props.productType;
                if (this.props.productList[this.props.exchange][this.props.productType]) {
                    if (this.props.productList[this.props.exchange][this.props.productType].includes(inputItem)) checked = true;
                }
                return (<li key={index}>
                            <input type="checkbox" checked={checked} onChange={(event) => this.checkboxHandler(event, inputItem, index, exchange, productType)}/>{inputItem}          
                        </li>
                        )
            });
            searchInput = <input style={{"textAlign": "center"}} type="text" placeholder="Search" onChange={(event) => this.searchProductsHandler(event)}/>
        }
            
        return (
            <div ref={this.state.checkList} className="dropdown-check-list" tabIndex="100">
                <span className="anchor" onClick={this.selectHandler}>{this.props.title}</span>
                <ul className="items">
                    {searchInput}
                    {list}
                </ul>
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateProductList: (productList, exchange, oldList, productType) => dispatch(actions.updateProductList(productList, exchange, oldList, productType))
    };
};

const mapStateToProps = state => {
    return {
        productList: state.newTourney.productList
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckDropDown);