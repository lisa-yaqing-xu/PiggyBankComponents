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
                selectedDateRange:{
                    type: Object,
                    value: {},
                    notify: true
                },
                calendarOpenDate: {
                    type: Number,
                    notify: true,
                    value:  Date.now()                    
                }
            }
        }

        constructor() {
            super();
        }

        handleOnBlur() {
            this.toggleCalendar();
        }

        handleTap(e) {
            this.toggleCalendar(Polymer.dom(e).localTarget.id);
        }

        _selectedStartDateChange(timestamp) {
            if (timestamp != null) {
                let date = new Date(timestamp);
                let month = this.getMonthName(date);
                let year = date.getFullYear(); 
                let day = date.getDate(); 
                if (day < 10) {
                    day = `0${day}`;
                }
                this.set('formattedStartDate', `${month} ${day}, ${year} `);
                this.selectedDateRange.startDate = timestamp;            
                this.selectedDateRange = Object.assign({},this.selectedDateRange);    
            }            
        }

        _selectedEndDateChange(timestamp) {
            if (timestamp != null) {
                let date = new Date(timestamp);
                let month = this.getMonthName(date);
                let year = date.getFullYear(); 
                let day = date.getDate(); 
                if (day < 10) {
                    day = `0${day}`;
                }
                this.set('formattedEndDate', `${month} ${day}, ${year} `);
                this.selectedDateRange.endDate = timestamp;            
                this.selectedDateRange = Object.assign({},this.selectedDateRange);
            }
        }

        toggleCalendar(id) {
            if (id) {
                let calendar = this.shadowRoot.getElementById(`${id}-calendar`);
                console.log(calendar);
                if (calendar.style.display == 'block') {
                    calendar.style.display = 'none';
                }
                else {
                    calendar.style.display = 'block';
                    calendar.focus();
                }    
            }
            else {
                let startCal = this.shadowRoot.getElementById('start-calendar');
                let endCal = this.shadowRoot.getElementById('end-calendar');
                startCal.style.display = 'none';
                endCal.style.display = 'none';
            }
        }

        getMonthName(date) {
          const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          return months[date.getMonth()];
        }
    }
    
    customElements.define(PBProjectTerm.is, PBProjectTerm);
})();
