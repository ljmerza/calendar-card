import moment from './moment';


/**
 * Creates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */
export default class CalendarEvent {

    constructor(calendarEvent) {
        this._calendarEvent = calendarEvent;
    }

    get rawEvent(){
        return this._calendarEvent;
    }

    get id() {
        return (this.rawEvent.id || this.rawEvent.uid) + this.title;
    }

    get originCalendar(){
        return this.rawEvent.originCalendar;
    }

    /**
     * get the start time for an event
     * @return {String}
     */
    get startDateTime() {
        if (this._startDateTime === undefined){
            const date = this.rawEvent.start && this.rawEvent.start.date || this.rawEvent.start.dateTime || this.rawEvent.start || '';
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
            const date = this.rawEvent.end && this.rawEvent.end.date || this.rawEvent.end.dateTime || this.rawEvent.end;
            this._endDateTime = this._processDate(date, true);
        }
        return this._endDateTime;
    }

    get addDays(){
        return this.rawEvent.addDays !== undefined ? this.rawEvent.addDays : false;
    }

    get daysLong() {
        return this.rawEvent.daysLong;
    }

    get isFirstDay(){
        return this.rawEvent.addDays === 0;
    }

    get isLastDay(){
        return this.rawEvent.addDays === (this.rawEvent.daysLong - 1);
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
     * is this recurring?
     * @return {boolean}
     */
    get isRecurring() {
        return !!this.rawEvent.recurringEventId;
    }

    /**
     * get the URL for an event
     * @return {String}
     */
    get htmlLink() {
        return this.rawEvent.htmlLink || '';
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
        let title = this.rawEvent.summary || this.rawEvent.title || '';

        if (this.rawEvent.daysLong){
            title += ` (${this.addDays + 1}/${this.daysLong})`;
        }

        return title;
    }

    /**
     * get the description for an event
     * @return {String}
     */
    get description() {
        return this.rawEvent.description;
    }

    /**
     * parse location for an event
     * @return {String}
     */
    get location() {
        if (!this.rawEvent.location) return '';
        return this.rawEvent.location.split(',')[0] || '';
    }

    /**
     * get location address for an event
     * @return {String}
     */
    get locationAddress() {
        if (!this.rawEvent.location) return '';

        const address = this.rawEvent.location.substring(this.rawEvent.location.indexOf(',') + 1);
        return address.split(' ').join('+');
    }

    /**
     * is the event a full day event?
     * @return {Boolean}
     */
    get isAllDayEvent() {

        // if multiday then only full day is first day is all day
        if (this.isFirstDay && (this.startDateTime.hour() || this.startDateTime.minutes())) return false;
        else if (this.isFirstDay) return true;
        // same for last day
        if (this.isLastDay && (this.endDateTime.hour() || this.endDateTime.minutes())) return false;
        else if (this.isLastDay) return true;
        
        // if we got this far and add days is true then it's a middle day of a multi day event so its all day
        if(this.addDays) return true;

        // 
        if (this.endDateTime.diff(this.startDateTime, 'hours') <= 24 && this.startDateTime.hour() === 0) return true;
    }
}
