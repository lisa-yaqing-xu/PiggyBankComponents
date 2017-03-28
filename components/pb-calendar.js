(function () {
    'use strict';

    class PBCalendar extends Polymer.Element {
        constructor() {
            super();
            this.timestampDay = 1000 * 60 * 60 * 24; //ms * s * m * h
        }

        static get is() {
            return 'pb-calendar';
        }

        static get properties() {
            return {
                monthTimestamp: {
                    type: Number,
                    notify: true,
                },
                selectedDate: {
                    type: Object,
                    notify: true,
                    value: null
                },
                dates: {
                    type: Array,
                    notify: true
                },
                hoverData: {
                    type: Object,
                    notify: true
                },
                selectedDateIndex: {
                    type: Object,
                    notify: true,
                    value: { row: -1, col: -1 }
                }
            }
        }

        getCalendarVal(dateObj) {
            return dateObj ? dateObj.getDate() : null;
        }

        /*
            FUNCTIONS
        */
        connectedCallback() {
            Polymer.RenderStatus.beforeNextRender(this, function () {
                let { startDate, endDate } = this.calculateMonthBound(this.monthTimestamp)
                this.dates = this.calculateCalendarBox(startDate, endDate)
            });

        }

        removeHover() {
            this.set('hoverData', { class: '' });
        }

        onDateHover(event) {
            let { target, row, col, date } = this.getDateInfoFromEventTarget(event, this.dates);
            if (date) {
                this.set('hoverData', {
                    row: row,
                    col: col,
                    date: date,
                    display: true,
                    class: `active${(this.isSameDate(date, this.selectedDate) ? ' selected' : '')}`,
                    style: `left: ${target.offsetLeft - 2}px; top: ${target.offsetTop - 1}px;`
                })
            }
            else {
                this.removeHover();
            }
        }

        onDateSelect(event) {
            let { target, row, col, date } = this.getDateInfoFromEventTarget(event, this.dates);
            if (date) {
                this.set('selectedDateIndex', { row: row, col: col });
                this.set('selectedDate', date);
                this.set('hoverData.class', 'active selected')
            } else {
                this.set('selectedDateIndex', { row: -1, col: -1 });
                this.set('selectedDate', null);
            }
        }
        getCalendarClass(date, selectedDate) {
            if (!date) {
                return 'inactive'
            } else {

                return this.isSameDate(date, selectedDate) ? 'selected' : ''
            }
        }
        /*
            OBSERVERS
        */

        monthChanged(newMonth, oldMonth) {
            //TODO: implement
        }

        /*
            HELPER FUNCTIONS
        */
        calculateMonthBound(timeStampDate) {
            let initDate = new Date(timeStampDate);
            initDate.setHours(0, 0, 0, 0)

            let initDateDay = initDate.getDate();
            let initDateMonth = initDate.getMonth();
            let initDateYear = initDate.getFullYear();

            let numOfDaysInMonth = this.getNumDaysInMonth(initDateMonth, initDateYear);

            let initialMonthDate = new Date(initDateYear, initDateMonth, 1);
            let endMonthDate = new Date(initDateYear, initDateMonth, numOfDaysInMonth);

            return { startDate: initialMonthDate, endDate: endMonthDate };
        }

        calculateCalendarBox(startDate, endDate) {
            let startDayOfWeek = startDate.getDay();
            let numDays = endDate.getDate();
            let boxesRequired = numDays + startDayOfWeek;
            let numRows = Math.ceil(boxesRequired / 7);

            let dates = [];

            let numEmptyStart = startDayOfWeek;
            let numDaysFilled = 0;
            let thisMonth = startDate.getMonth();
            let thisYear = startDate.getFullYear();

            for (let i = 0; i < numRows; i++) {
                let calendarRow = [];
                for (let j = 0; j < 7; j++) {
                    if (numEmptyStart > 0 || numDaysFilled === numDays) {
                        numEmptyStart--;
                        calendarRow.push(null);
                    } else {
                        numDaysFilled++;
                        calendarRow.push(new Date(thisYear, thisMonth, numDaysFilled));
                    }
                }
                dates.push(calendarRow);
            }
            return dates;
        }

        getNumDaysInMonth(month, year) {
            if (month === 1) { //feburary
                return (year % 4 === 0) ? 29 : 28 //leap year
            }
            else if (month <= 6) {
                return (month % 2 === 0) ? 31 : 30;
            }
            else return (month % 2 === 0) ? 30 : 31;
        }

        getDateInfoFromEventTarget(event, dateArr) {
            let target = event.target;
            let row = Number(target.getAttribute('data-row'));
            let col = Number(target.getAttribute('data-col'));
            return {
                target: target,
                row: row,
                col: col,
                date: dateArr[row][col]
            };
        }

        isSameDate(date1, date2) {
            if (!date1 || !date2) return false;
            return date1.getTime() === date2.getTime();
        }
    }

    customElements.define(PBCalendar.is, PBCalendar);

})();


