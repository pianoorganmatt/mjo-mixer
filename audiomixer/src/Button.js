import React from 'react';

const Button = ({ onClick, label, className }) => {
    return (
        <div className={`${className}`} onClick={onClick}>
            <div className="button-control">{label}</div>
        </div>
    );
};

export default Button;
