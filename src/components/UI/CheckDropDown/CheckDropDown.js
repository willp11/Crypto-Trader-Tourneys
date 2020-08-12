import React, {Component, createRef} from 'react';
import './CheckDropDown.css';
import {connect} from 'react-redux';
import * as actions from '../../../store/actions/index';

class CheckDropDown extends Component {
    
    state = {
        checkList: null,
        productsSelected: []
    }

    componentDidMount() {
        let newRef = createRef();
        this.setState({
            checkList: newRef
        })
    }

    selectHandler = () => {

        if (this.state.checkList.current.classList.contains('visible')) {
            this.state.checkList.current.classList.remove('visible'); 
        } else {
            this.state.checkList.current.classList.add('visible'); 
        }
    };

    checkboxHandler = (event, inputItem) => {
//        let newProducts = {};
//        console.log(this.state.productsSelected[this.props.exchange]);
//        newProducts[this.props.exchange] = [...this.state.productsSelected[this.props.exchange]];
        
        let newProducts = [...this.state.productsSelected];

        if (event.target.checked) {
            newProducts.push(inputItem);
        } else {
            newProducts.pop(inputItem);
        }
        
        this.setState({
            productsSelected: newProducts
        });
        
        this.props.updateProductList(newProducts, this.props.exchange, this.props.productList);
    }
    
    render() {
        let list = null;
        if (this.props.products) {
            list = this.props.products.map((inputItem, index) => {
                return (<li key={index}>
                            <input type="checkbox" onClick={event => this.checkboxHandler(event, inputItem)}/>{inputItem}          
                        </li>
                        )
            })
        }
            
        return (
            <div ref={this.state.checkList} className="dropdown-check-list" tabIndex="100">
                <span className="anchor" onClick={this.selectHandler}>{this.props.title}</span>
                <ul className="items">
                    {list}
                </ul>
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateProductList: (productList, exchange, oldList) => dispatch(actions.updateProductList(productList, exchange, oldList))
    };
};

const mapStateToProps = state => {
    return {
        productList: state.newTourney.productList
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckDropDown);