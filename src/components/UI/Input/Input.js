import React from 'react';
import './Input.css';

const Input = (props) => {
    
    return (
        <input type={props.type} className="Input" placeholder={props.placeholder} onChange={props.changed}/>
    )
};

export default Input;