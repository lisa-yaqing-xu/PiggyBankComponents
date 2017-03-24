(function () {
    'use strict';
    const timestampDay = 1000 * 60 * 60 * 24; //ms * s * m * h

    let polymerConfig = {
        is: 'pb-calendar',
        properties: {
            monthTimestamp: {
                type: Number,
                notify: true,
                observer: "_monthChanged"
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
            hoverObject: {
                type: Object
            }

        },
        listeners:{
            tap: 'onTap'
        },
        attached: onAttach,
        removeHover: removeHover,
        onDateHover: onDateHover,
        onDateSelect: onDateSelect,
        getCalendarClass: getCalendarClass,
        onTap: onDateSelect,
        getCalendarVal: (dateObj) => dateObj ? dateObj.getDate() : null

    };
    Polymer(polymerConfig);
    /*
        FUNCTIONS
    */
    function onAttach() {
        let { startDate, endDate } = calculateMonthBound(this.monthTimestamp)
        this.dates = calculateCalendarBox(startDate, endDate)
        this.hoverObject = this.$$('#pb-calendar-hover-display');
    }

    function removeHover() {
        this.set('hoverData', { class: '' });
    }

    function onDateHover(event) {
        let { target, row, col, date } = getDateInfoFromEventTarget(event, this.dates);
        if (date) {
            this.set('hoverData', {
                row: row,
                col: col,
                date: date,
                display: true,
                class: `active${(isSameDate(date, this.selectedDate)?' selected':'')}`,
                style: `left: ${target.offsetLeft - 2}px; top: ${target.offsetTop - 1}px;`
            })
        }
        else {
            this.removeHover();
        }
    }

    function onDateSelect(event) {
        let { target, row, col, date } = getDateInfoFromEventTarget(event, this.dates);
        if (date) {
            this.set('selectedDateIndex', { row: row, col: col });
            this.set('selectedDate', date);
            this.set('hoverData.class', 'active selected')
        } else {
            this.set('selectedDateIndex', { row: -1, col: -1 });
            this.set('selectedDate', null);
        }
    }
    function getCalendarClass(date, selectedDate) {
        if(!date){
            return 'inactive'
        } else {

            return isSameDate(date, selectedDate)? 'selected' : ''
        }
    }
    /*
        OBSERVERS
    */

    function monthChanged(newMonth, oldMonth) {
        //TODO: implement
    }

    /*
        HELPER FUNCTIONS
    */
    function calculateMonthBound(timeStampDate) {
        let initDate = new Date(timeStampDate);
        initDate.setHours(0, 0, 0, 0)

        let initDateDay = initDate.getDate();
        let initDateMonth = initDate.getMonth();
        let initDateYear = initDate.getFullYear();

        let numOfDaysInMonth = getNumDaysInMonth(initDateMonth, initDateYear);

        let initialMonthDate = new Date(initDateYear, initDateMonth, 1);
        let endMonthDate = new Date(initDateYear, initDateMonth, numOfDaysInMonth);

        return { startDate: initialMonthDate, endDate: endMonthDate };
    }

    function calculateCalendarBox(startDate, endDate) {
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

    function getNumDaysInMonth(month, year) {
        if (month === 1) { //feburary
            return (year % 4 === 0) ? 29 : 28 //leap year
        }
        else if (month <= 6) {
            return (month % 2 === 0) ? 31 : 30;
        }
        else return (month % 2 === 0) ? 30 : 31;
    }

    function getDateInfoFromEventTarget(event, dateArr) {
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

    function isSameDate(date1, date2){
        if(!date1 || !date2) return false;
        return date1.getTime() === date2.getTime();
    }
})();