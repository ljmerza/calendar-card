import { css } from 'lit-element';

const style = css`
    .calendar-card {
        display: flex;
        padding: 0 16px 4px;
        flex-direction: column;
    }

    .header {
        font-family: var(--paper-font-headline_-_font-family);
        -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
        font-size: var(--paper-font-headline_-_font-size);
        font-weight: var(--paper-font-headline_-_font-weight);
        letter-spacing: var(--paper-font-headline_-_letter-spacing);
        line-height: var(--paper-font-headline_-_line-height);
        text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
        opacity: var(--dark-primary-opacity);
        padding: 24px 0px 0px;
    }

    table {
        border-spacing: 0;
        margin-bottom: 10px;
    }

    .day-wrapper td {
        padding-top: 10px;
        cursor: pointer;
    }

    .day-wrapper.day-wrapper-last > td {
        padding-bottom: 10px;
        border-bottom: 1px solid;
    }

    .day-wrapper.day-wrapper-last:last-child > td {
        border-bottom: 0 !important;
    }

    .day-wrapper .overview {
        padding-left: 10px;
        cursor: pointer;
    }

    .day-wrapper .overview .title {
        font-size: 1.2em;
    }

    .day-wrapper .overview .time,
    .day-wrapper .location ha-icon {
        color: var(--primary-color);
    }

    .day-wrapper hr.progress-bar {
        border-style: solid;
        border-color: var(--secondary-color);
        border-width: 1px 0 0 0;
        margin-top: -7px;
        margin-left: 0px;
        color: var(--primary-color);
        width: 100%;
    }

    .day-wrapper ha-icon.progress-bar {
        height: 12px;
        width: 12px;
        color: var(--primary-color);
    }

    .day-wrapper .location a {
        text-decoration: none;
    }
`;

export default style;
