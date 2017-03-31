(function () {
    'use strict';

    class PBCalendar extends Polymer.Element {
        constructor() {
            super();
            this.timestampDay = 1000 * 60 * 60 * 24; //ms * s * m * h
            this.monthStr = ['January', 'Feburary', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
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
                },
                monthSelectionDate: {
                    type: Object,
                    notify: true
                },
                isDateSelectedThroughClick: Boolean
            }
        }
        static get observers() {
            return [
                '_updateSelectedDate(selectedDate)',
                '_updateMonth(monthTimestamp)'
            ]
        }


        /*
            FUNCTIONS
        */

        getYear(date) {
            return date.getFullYear();
        }
        getMonth(date) {
            return this.monthStr[date.getMonth()];
        }

        getCalendarVal(dateObj) {
            return dateObj ? dateObj.getDate() : null;
        }
        getSelectionIndex(dateObj) {
            if (!dateObj) {
                return { row: -1, col: -1 };
            } else {
                let col = dateObj.getDay();
                let row = 0;
                let date = dateObj.getDate();
                while (date > 7) {
                    date -= 7;
                    row++;
                }
                if ((date - 1) > col) row++;
                return { row, col };
            }

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
            this.isDateSelectedThroughClick = true;
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

        incrementMonth(){
            this.monthTimestamp = this.calculateMonthChange(this.monthSelectionDate, 1).getTime();
        }

        decrementMonth(){
            this.monthTimestamp = this.calculateMonthChange(this.monthSelectionDate, -1).getTime();
        }

        incrementYear(){
            this.monthTimestamp = this.calculateMonthChange(this.monthSelectionDate, 12).getTime();
        }

        decrementYear(){
            this.monthTimestamp = this.calculateMonthChange(this.monthSelectionDate, -12).getTime();
        }

        calculateMonthChange(monthData, amount){
            let year = monthData.getFullYear();
            let month = monthData.getMonth();
            let numShift = Math.ceil(Math.abs(amount/12)) * 12;

            let newMonth = (month + numShift + amount) % 12;
            let newYear = year;
            if(amount > 0) newYear += Math.floor((month + amount) / 12);
            else if (amount < 0) newYear -= Math.floor((month + amount - 11)/-12)
            return new Date(newYear, newMonth, 1);
        }


        /*
            OBSERVERS
        */

        _updateMonth(monthTimestamp) {
            let { startDate, endDate, monthSelectionDate } = this.calculateMonthBound(monthTimestamp);
            this.monthSelectionDate = monthSelectionDate;
            this.dates = this.calculateCalendarBox(startDate, endDate);
            if (this.selectedDate) {
                // check if date is in this month and year
                let month = this.selectedDate.getMonth();
                let year = this.selectedDate.getFullYear();
                let thisMonth = this.monthSelectionDate.getMonth();
                let thisYear = this.monthSelectionDate.getFullYear();

                if (month === thisMonth && year === thisYear) {
                    // if so, update indices
                    this.selectedDateIndex = this.getSelectionIndex(this.selectedDate)
                } else {
                    // else update date
                    // don't also update the selected date index 
                    // because this will trigger date update selectionDateIndex
                    let day = Math.min(this.selectedDate.getDate(), this.getNumDaysInMonth(thisMonth, thisYear));
                    this.selectedDate = new Date(thisYear, thisMonth, day);
                }

            }
        }

        _updateSelectedDate(selectedDate) {
            if (!selectedDate) {
                this.selectionDateIndex = this.getSelectionIndex(selectedDate);
                return;
            }

            if (this.isDateSelectedThroughClick) {
                this.isDateSelectedThroughClick = false;
                return;
            }

            let selectedMonth = selectedDate.getMonth();
            let selectedYear = selectedDate.getFullYear();
            let displayMonth = this.monthSelectionDate.getMonth();
            let displayYear = this.monthSelectionDate.getFullYear();
            let sameMonth = selectedMonth === displayMonth;
            let sameYear = selectedYear === displayYear;

            let newMonthDateObj = new Date(this.monthSelectionDate);
            if (!sameMonth) newMonthDateObj.setMonth(selectedMonth);
            if (!sameYear) newMonthDateObj.setFullYear(selectedYear);

            let newMonthTimeStamp = newMonthDateObj.getTime();

            if (this.monthTimestamp === newMonthTimeStamp) {
                this.selectionDateIndex = this.getSelectionIndex(selectedDate);
            } else {
                this.monthTimestamp = newMonthTimeStamp;
            }
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

            return { startDate: initialMonthDate, endDate: endMonthDate, monthSelectionDate: initDate };
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


