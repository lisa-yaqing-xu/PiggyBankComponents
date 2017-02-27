(function () {
    'use strict';

    let polymerConfig = {
        is: 'pb-card',
        properties: {
            cost: {
                type: Number,
                notify: true
            },
            label: {
                type: String,
                notify: true
            }
        },
        displayCost: function (cost) {
            let commaStr = cost.toLocaleString(undefined, { minimumFractionDigits: 0 });
            return `$${commaStr}`;
        }
    };
    Polymer(polymerConfig);
})();