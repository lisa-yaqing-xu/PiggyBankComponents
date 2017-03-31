(function () {

    class PBProjectTerm extends Polymer.Element {
        static get is() { return 'pb-project-term'; }

        static get properties() {
            return {
                selectedStartDate: {
                    type: Object,
                    observer: "_selectedStartDateChange"
                },
                selectedEndDate: {
                    type: Object,
                    observer: "_selectedEndDateChange"
                },
                formattedStartDate: {
                    type: String,
                    value: ""
                },
                formattedEndDate: {
                    type: String,
                    value: ""
                },
                selectedDateRange: {
                    type: Object,
                    value: {},
                    notify: true
                },
                calendarStartOpenDate: {
                    type: Number,
                    notify: true,
                    value: Date.now()
                },
                calendarEndOpenDate: {
                    type: Number,
                    notify: true,
                    value: Date.now()
                },
                domCache: Object,
                tappedStatus: Object,
                calendarTapped: Object,
            }
        }

        constructor() {
            super();
            this.domCache = {};
            this.tappedStatus = {};
            this.calendarTapped = {};
            
            window.addEventListener('click', (e) => {                
                let domCache = this.getDomCache();
                let tappedStatus = this.tappedStatus;
                let tappedIds = Object.keys(tappedStatus);
                tappedIds.forEach((calId) => {
                    let isRecentlyTapped = tappedStatus[calId];
                    if (isRecentlyTapped) {
                        tappedStatus[calId] = false;
                    } else {
                        let calendar = domCache[calId];
                        this.hideCalendar(calendar);
                    }
                })
            })
        }

        getCalendarId(id){
            return `${id}-calendar`;
        }

        getDomCache() {
            if (Object.keys(this.domCache).length === 0) {
                ['start','end'].forEach((id)=>{
                    let calId = this.getCalendarId(id);
                    this.domCache[id] = this.shadowRoot.getElementById(id);
                    this.domCache[calId] = this.shadowRoot.getElementById(calId);
                });
            }
            return this.domCache;
        }

        handleOnBlur() {
            this.hideAllCalendars();
        }

        handleTap(e) {  
            let id = Polymer.dom(e).localTarget.id;
            let calId = this.getCalendarId(id);
            this.tappedStatus[calId] = true;
            this.setCalendarDisplay(calId);
            e.target.focus();
        }

        handleCalendarTap(e){
            this.calendarStartTapped = true;
            let calId = Polymer.dom(e).localTarget.id;
            this.tappedStatus[calId] = true;
        }

        onStartInputBlur(e) {
            this.setNewDateThroughInput('selectedStartDate',e);
        }

        onEndInputBlur(e) {
            this.setNewDateThroughInput('selectedEndDate',e);
        }

        onInputKeyup(e){
            if(e.which== 13){
                e.target.blur();
            }
        }

        setNewDateThroughInput(updateField, e){
            let newDate = new Date(e.target.value);
            let date;
            if(isNaN( newDate.getTime())){
                //will not trigger new data
                date = this[updateField];
                e.target.value = date?this.getFormattedDateString(date.getTime()):null;
            } else {
                date = newDate;
            }
            this.set(updateField, date);
        }

        _selectedStartDateChange(timestamp) {
            if (timestamp != null) {
                let formattedDateStr = this.getFormattedDateString(timestamp);
                this.set('formattedStartDate',formattedDateStr);
                this.selectedDateRange.startDate = timestamp;
                this.selectedDateRange = Object.assign({}, this.selectedDateRange);
            }
        }

        _selectedEndDateChange(timestamp) {
            if (timestamp != null) {
                let formattedDateStr = this.getFormattedDateString(timestamp);
                this.set('formattedEndDate',formattedDateStr);
                this.selectedDateRange.endDate = timestamp;
                this.selectedDateRange = Object.assign({}, this.selectedDateRange);
            }
        }
        getFormattedDateString(timestamp) {
                let date = new Date(timestamp);
                let month = this.getMonthName(date);
                let year = date.getFullYear();
                let day = date.getDate();
                if (day < 10) {
                    day = `0${day}`;
                }
                return `${month} ${day}, ${year}`;
        }

        setCalendarDisplay(id) {
            let domCache = this.getDomCache();
            let calendar = domCache[id];
            if (calendar.style.display == 'block') {
                this.hideCalendar(calendar);
            }
            else {
                this.showCalendar(calendar);
            }
        }
        showCalendar(calendar){
            calendar.style.display = 'block';
        }
        hideCalendar(calendar){
            calendar.style.display = 'none';
        }
        hideAllCalendars() {
            let startCal = this.shadowRoot.getElementById('start-calendar');
            let endCal = this.shadowRoot.getElementById('end-calendar');
            startCal.style.display = 'none';
            endCal.style.display = 'none';
        }

        getMonthName(date) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            return months[date.getMonth()];
        }
    }

    customElements.define(PBProjectTerm.is, PBProjectTerm);
})();
