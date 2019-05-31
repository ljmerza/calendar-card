import { css } from 'lit-element';

const style = css`
    .entities {
        padding-top: 10px;
    }

    .entities paper-checkbox {
        display: block;
        margin-bottom: 10px;
        margin-left: 10px;
    }

    .checkbox-options:first-of-type {
        margin-top: 10px;
    }

    .checkbox-options:last-of-type {
        margin-bottom: 10px;
    }

    .checkbox-options {
        display: flex;
    }

    .checkbox-options paper-checkbox {
        margin-top: 5px;
        width: 50%;
    }

    .overall-config {
        margin-bottom: 10px;
    }

    .origin-calendar {
        width: 50%;
        margin-left: 35px;
    }
`;

export default style;
