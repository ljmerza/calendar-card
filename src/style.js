import { css } from 'lit-element';

const style = css`

    .calendar-card {
        display: flex;
        padding: 0 16px 4px;
        flex-direction: column;
    }

    .max-height {
        max-height: 500px;
        overflow-y: scroll;
    }

    .loader {
        width: 100%;
        padding-top: 30px;
        padding-bottom: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
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

    .no-pointer {
        cursor: default !important;
    }

    table {
        border-spacing: 0;
        margin-bottom: 10px;
        width: 100%;
    }

    .highlight-events .title, .highlight-events .date {
        color: var(--accent-color) !important;
    }

    .day-wrapper td {
        padding-top: 10px;
        cursor: pointer;
    }

    .day-wrapper.day-wrapper-last > td {
        padding-bottom: 10px;
        border-bottom: 1px solid;
        border-color: var(--accent-color);
    }

    .day-wrapper.day-wrapper-last:last-child > td {
        border-bottom: 0 !important;
    }

    .day-wrapper .overview {
        padding-left: 10px;
        cursor: pointer;
    }

    .day-wrapper .overview .time,
    .day-wrapper .location ha-icon {
        color: var(--secondary-text-color);
    }

    .day-wrapper hr.progress-bar {
        border-style: solid;
        border-color: var(--accent-color);
        border-width: 1px 0 0 0;
        color: var(--primary-color);
        display:inline-block;
        position:relative;
        top:-7px;
        width: 100%;
        margin: 0;
    }

    .day-wrapper ha-icon.progress-bar {
        display:block;
        height:9px;
        --mdc-icon-size: 9px;
        color: var(--accent-color);
        position:relative;
        top:5px;
    }

    .day-wrapper .overview {
        word-break: break-word;
    }

    .day-wrapper .location {
        max-width: 100px;
        word-break: break-word;
    }

    .day-wrapper .location a {
        text-decoration: none;
        display: flex;
        color: var(--accent-color);
    }

    .event-origin span {
        color: var(--accent-color);
        margin-right: -4px;
    }

    .event-origin ha-icon {
        position: relative;
        top: -1px;
        left: 4px;
        color: var(--accent-color);
        --mdc-icon-size: 13px;
    }
`;

export default style;
