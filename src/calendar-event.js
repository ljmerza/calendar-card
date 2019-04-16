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

    get id(){
        return this.calendarEvent.id + this.title;
    }

    get rawEvent(){
        return this.calendarEvent;
    }

    /**
     * get the start time for an event
     * @return {String}
     */
    get startDateTime() {
        if (this._startDateTime === undefined){
            const date = this.calendarEvent.start && this.calendarEvent.start.date || this.calendarEvent.start.dateTime || this.calendarEvent.start || '';
            this._startDateTime =  this._processDate(date);
        }
        return this._startDateTime;
    }

    /**
     * get the end time for an event
     * @return {String}
     */
    get endDateTime() {
        if (this._endDateTime === undefined) {
            const date = this.calendarEvent.end && this.calendarEvent.end.date || this.calendarEvent.end.dateTime || this.calendarEvent.end;
            this._endDateTime = this._processDate(date, true);
        }
        return this._endDateTime;
    }

    get addDays(){
        return this.calendarEvent.addDays !== undefined ? this.calendarEvent.addDays : false;
    }

    get daysLong() {
        return this.calendarEvent.daysLong;
    }

    get isFirstDay(){
        return this.calendarEvent.addDays === 0;
    }

    get isLastDay(){
        return this.calendarEvent.addDays === (this.calendarEvent.daysLong - 1);
    }

    /**
     * 
     * @param {string} date
     * @param {boolean} isEndDate
     */
    _processDate(date, isEndDate=false){
        if (date) {
            date = moment(date);
            // add days to a start date for multi day event
            if (this.addDays !== false) {
                if (!isEndDate && this.addDays) date = date.add(this.addDays, 'days');

                // if first day and end time then set to end of current event day that day
                if (this.isFirstDay && isEndDate) {
                    date = moment(this.startDateTime).endOf('day');

                } else if (this.isLastDay && !isEndDate) {
                    // if last day and start time then set start as start of day
                    date = date.startOf('day');
                }
            }
        }

        return date;
    }

    /**
     * get the URL for an event
     * @return {String}
     */
    get htmlLink() {
        return this.calendarEvent.htmlLink || '';
    }

    /**
     * is a multiday event (not all day)
     * @return {Boolean}
     */
    get isMultiDay() {
        if (this.endDateTime.diff(this.startDateTime, 'hours') <= 24 && this.startDateTime.hour() === 0) return false;
        if (this.startDateTime.date() !== this.endDateTime.date()) return true;
    }

    /**
     * get the title for an event
     * @return {String}
     */
    get title() {
        let title = (this.calendarEvent.summary || this.calendarEvent.title || '');
        if (this.calendarEvent.daysLong){
            title += ` (${this.addDays + 1}/${this.daysLong})`;
        }
        return title;
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
    get isAllDayEvent() {
        if (this.isFirstDay) return false;
        if (this.isLastDay) return false;
        if(this.addDay !== false) return true;
        if (this.endDateTime.diff(this.startDateTime, 'hours') <= 24 && this.startDateTime.hour() === 0) return true;
    }
}