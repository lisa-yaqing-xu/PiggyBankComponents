(function () {
    'use strict';
    
    let polymerConfig = {
        is: 'pb-project-term',
        properties: {
            selectedStartDate: {
                type: Object,
                observer: "_selectedStartDateChange"
            },
            selectedEndDate: {
                type: Object,
                observer: "_selectedEndDateChange"
            },
            formattedStartDate: {
                type: String
            },
            formattedEndDate: {
                type: String
            }

        },
        listeners:{
            
        },
        handleOnBlur: function() {
            console.log('herrrrr e');
            toggleCalendar();
        },
        handleTap: function(e) {
            console.log(Polymer.dom(e).localTarget.id);
            toggleCalendar(Polymer.dom(e).localTarget.id);
        },
        _selectedStartDateChange: function(timestamp) {
            let date = new Date(timestamp);
            let month = getMonthName(date);
            let year = date.getFullYear(); 
            let day = date.getDate(); 
            if (day < 10) {
                day = `0${day}`;
            }
            console.log(`${month} ${day}, ${year} `);
            this.set('formattedStartDate', `${month} ${day}, ${year} `)
        },
        _selectedEndDateChange: function(timestamp) {
            let date = new Date(timestamp);
            let month = getMonthName(date);
            let year = date.getFullYear(); 
            let day = date.getDate(); 
            if (day < 10) {
                day = `0${day}`;
            }
            console.log(`${month} ${day}, ${year} `);
            this.set('formattedEndDate', `${month} ${day}, ${year} `)
        }

    };
    Polymer(polymerConfig);
    /*
        FUNCTIONS
    */

    function toggleCalendar(id) {
        if (id) {
            let calendar = document.getElementById(`${id}-calendar`);
            if (calendar.style.display == 'block') {
                calendar.style.display = 'none';
            }
            else {
                calendar.style.display = 'block';
            }    
        }
        else {
            let startCal = document.getElementById('start-calendar');
            let endCal = document.getElementById('end-calendar');
            startCal.style.display = 'none';
            endCal.style.display = 'none';
        }
        
    }
    function getMonthName(date) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      return months[date.getMonth()];
    }
    
})();
