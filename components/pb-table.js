
    (function () {
        'use strict';

        let polymerConfig = {
            is: 'pb-table',
            behaviors: [
                Polymer.IronResizableBehavior
            ],
            properties: {
                headers: {
                    type: Array
                },
                data: {
                    type: Array,
                    observer: 'onDataChange',
                    notify: true
                }
            },
            observers: [
                '_currencyChanged(preload, src, size)'
            ],
            onDataChange: function(newData) {
                console.log('new', newData);
                newData.forEach((field) => {
                    field.formattedForecastedCost = this._convertToCurrency(field.forecastedCost);
                    field.formattedActualCost= this._convertToCurrency(field.actualCost);
                    field.formattedProjectedStartDate = this._convertToDate(field.projectedStartDate);
                    field.formattedProjectedEndDate = this._convertToDate(field.projectedEndDate);
                });
                console.log('new', newData);
            },
            _toArray: function(obj) {
                return Object.keys(obj).map((key) => {
                    return {
                        name: key,
                        value: obj[key]
                    };
                });
            },
            _convertToCurrency: function(num) {
                let numStr = num.toString();
                let formattedNumber = "";
                let count = 0;
                for (let i = numStr.length - 1; i >= 0; i--) {
                    if (count === 3) {
                        formattedNumber = numStr[i] + "," + formattedNumber;
                        count = 1;
                    } else {
                        formattedNumber = numStr[i] + formattedNumber;
                        count++;
                    }
                }
                formattedNumber = "$" + formattedNumber;
                return formattedNumber;
            },
            _convertToDate: function(timestamp) {
                let date = new Date(timestamp);
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let year = date.getFullYear().toString().slice(2);
                return `${month}/${day}/${year}`;
            },
            _hasExceededCost(forecasted, actual) {
                if (actual > forecasted) {
                    return 'exceeds'
                }
            }
        };
        Polymer(polymerConfig);
    })();