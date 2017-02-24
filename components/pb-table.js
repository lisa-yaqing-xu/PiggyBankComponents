
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
                    observer: 'logChange',
                    notify: true
                }
            },
            observers: [
                '_currencyChanged(preload, src, size)'
            ],
            logChange: function(newValue, oldValue) {
                console.log('new', newValue);
                newValue.forEach((a) => {
                    a.forecastedCost = this._convertToCurrency(a.forecastedCost);
                    a.actualCost= this._convertToCurrency(a.actualCost);
                    a.projectedStartDate = this._convertToDate(a.projectedStartDate);
                    a.projectedEndDate = this._convertToDate(a.projectedEndDate);
                });
                //console.log('new', newValue);
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
            }
        };
        Polymer(polymerConfig);
    })();