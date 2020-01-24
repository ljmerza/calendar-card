import { html } from 'lit-element';
import moment from './locales';

import { getEventDateTime, openLink } from './event.tools';

/**
  * create card header
  * @return {TemplateResult}
  */
export function createHeader(config) {
    if (config.hideHeader || config.title === false) return html``;
    return html`<div class='header'>${config.title}</div>`;
}

/**
  * generates HTML for showing date an event is taking place
  * @param {number} index index of current day event
  * @param {Moment} momentDay
  */
export function getDateHtml(index, momentDay, config) {
    const top = index === 0 ? momentDay.format(config.dateTopFormat) : '';
    const bottom = index === 0 ? momentDay.format(config.dateBottomFormat) : '';

    return html`
      <div>${top}</div>
      <div>${bottom}</div>
    `;
}

/**
 * if event is going on now then build progress bar for event
 * @param {CalendarEvent} event
 * @return {TemplateResult}
 */
export function getProgressBar(event) {
    if (!event.startDateTime || !event.endDateTime || event.isAllDayEvent) return html``;

    const now = moment(new Date());
    if (now.isBefore(event.startDateTime) || now.isSameOrAfter(event.endDateTime) || !event.startDateTime.isValid() || !event.endDateTime.isValid()) return html``;

    const nowSeconds = now.unix();
    const startSeconds = event.startDateTime.unix();
    const endSeconds = event.endDateTime.unix();
    const secondsPercent = (nowSeconds - startSeconds) / (endSeconds - startSeconds) * 100;

    return html`
      <ha-icon 
        icon="mdi:circle" 
        style='margin-left:${secondsPercent}%;'
        class="progress-bar" 
      ></ha-icon>
      <hr class="progress-bar" />
    `;
}

export function getEventOrigin(event, config){
    if (!config.showEventOrigin || !event.originCalendar || !event.originCalendar.name) return html``;

    return html`
      <div class='event-origin'>
        <span>${event.originCalendar.name}</span>
        <ha-icon icon="mdi:calendar-blank-outline"></ha-icon> 
      </div>
    `;
}

/**
  * generates HTML for showing an event times
  * @param {CalendarEvent} event
  */
export function getTimeHtml(event, config) {
    if (config.hideTime === true) return html``;
    const date = getEventDateTime(event, config, config.timeFormat);
    return html`<div class="time">${date}</div>`;
}

/**
 * generate link for an Anchor element
 * @param {Config} config 
 * @param String} link 
 */
export const getLink = (config, link) => {
  if (config.disableLinks) return '#';
  else link;
}

/**
  * generate the html for showing an event location
  * @param {CalendarEvent} event
  */
export function getLocationHtml(event, config) {
  if (!event.location || !event.locationAddress) return html``;
      
  const link = `https://www.google.com/maps?daddr=${event.location} ${event.locationAddress}`;

  return html`
    <a @click=${e => openLink(e, link, config)} title='open location' class=${config.disableLinks ? 'no-pointer' : ''}>
      ${config.showLocationIcon ? 
        html`
          <div>
            <ha-icon icon="mdi:map-marker"></ha-icon>&nbsp;
          </div>
        ` : null
      }
      <div>
        ${config.showLocation ? event.location : ''}
      </div>
    </a>
  `;
}