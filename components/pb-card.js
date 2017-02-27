(function () {
    'use strict';

    let polymerConfig = {
        is: 'pb-card',
        behaviors: [
            Polymer.IronResizableBehavior
        ],
        properties: {
            label: {
                type: String
            },
            cost: {
                type: Number,
                observer: 'onCostChange',
                notify: true
            },
            _formattedCost: {
                type: String
            }
        },
        onCostChange: function(newCost) {
            this._formattedCost = this._convertToCurrency(newCost);
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
        }
    };
    Polymer(polymerConfig);
})();