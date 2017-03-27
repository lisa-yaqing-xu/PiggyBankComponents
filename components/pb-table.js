
(function () {
    
    class PBTable extends Polymer.Element {

        static get is() { return 'pb-table'; }

        static get properties() {
            return {
                headers: {
                    type: Array
                },
                data: {
                    type: Array,
                    observer: 'onDataChange'
                }
            }
        }

        constructor() {
            super();
        }

        onDataChange(newData) {
            newData.forEach((field) => {
                field.formattedForecastedCost = this._convertToCurrency(field.forecastedCost);
                field.formattedActualCost= this._convertToCurrency(field.actualCost);
                field.formattedProjectedStartDate = this._convertToDate(field.projectedStartDate);
                field.formattedProjectedEndDate = this._convertToDate(field.projectedEndDate);
            });
        }

        _convertToCurrency(cost) {
            let commaStr = cost.toLocaleString(undefined, { minimumFractionDigits: 0 });
            return `$${commaStr}`;
        }

        _convertToDate(timestamp) {
            let date = new Date(timestamp);
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let year = date.getFullYear().toString().slice(2);
            return `${month}/${day}/${year}`;
        }

        _hasExceededCost(forecasted, actual) {
            if (actual > forecasted) {
                return 'exceeds'
            }
        }
    }
    customElements.define(PBTable.is, PBTable);
})();


