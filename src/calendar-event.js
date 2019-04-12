import moment from 'moment/src/moment';


/**
 * Creates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */
export default class CalendarEvent {
    /**
     * @param  {Object} calendarEvent
     */
    constructor(calendarEvent) {
        this.calendarEvent = calendarEvent;
    }

    /**
     * get the start time for an event
     * @return {String}
     */
    get startDateTime() {
        if (this.calendarEvent.start.date) {
            const dateTime = moment(this.calendarEvent.start.date);
            return dateTime.toISOString();
        }

        return this.calendarEvent.start && this.calendarEvent.start.dateTime || this.calendarEvent.start || '';
    }

    /**
     * get the end time for an event
     * @return {String}
     */
    get endDateTime() {
        return this.calendarEvent.end && this.calendarEvent.end.dateTime || this.calendarEvent.end || '';
    }

    /**
     * get the URL for an event
     * @return {String}
     */
    get htmlLink() {
        return this.calendarEvent.htmlLink || '';
    }

    /**
     * get the title for an event
     * @return {String}
     */
    get title() {
        return this.calendarEvent.summary || this.calendarEvent.title || '';
    }

    /**
     * get the description for an event
     * @return {String}
     */
    get description() {
        return this.calendarEvent.description;
    }

    /**
     * parse location for an event
     * @return {String}
     */
    get location() {
        if (!this.calendarEvent.location) return '';
        return this.calendarEvent.location.split(',')[0] || '';
    }

    /**
     * get location address for an event
     * @return {String}
     */
    get locationAddress() {
        if (!this.calendarEvent.location) return '';

        const address = this.calendarEvent.location.substring(this.calendarEvent.location.indexOf(',') + 1);
        return address.split(' ').join('+');
    }

    /**
     * is the event a full day event?
     * @return {Boolean}
     */
    get isFullDayEvent() {
        if (this.calendarEvent.start && this.calendarEvent.start.date) {
            return this.calendarEvent.start.date;
        }

        const start = moment(this.startDateTime);
        const end = moment(this.endDateTime);
        const diffInHours = end.diff(start, 'hours');
        return diffInHours >= 24;
    }
}