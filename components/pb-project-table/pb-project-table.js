
(function () {

    class PBProjectTable extends Polymer.Element {

        static get is() { return 'pb-project-table'; }

        static get properties() {
            return {
                data: {
                    type: Array,
                    notify: true
                },
                fieldConfig: {
                    type: Array,
                    notify: true
                }
            }
        }

        constructor() {
            super();
            this.fieldConfig = this.getFieldConfig();
            console.log(this.data, this.fieldConfig);
        }

        convertToCurrency(cost) {
            let commaStr = cost.toLocaleString(undefined, { minimumFractionDigits: 0 });
            return `$${commaStr}`;
        }

        convertToDate(timestamp) {
            let date = new Date(timestamp);
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let year = date.getFullYear().toString().slice(2);
            return `${month}/${day}/${year}`;
        }

        getFieldConfig() {
            let convertToCurrency = this.convertToCurrency;
            let convertToDate = this.convertToDate;
            return [
                {
                    header: 'Project Name',
                    type: 'text',
                    colorField: 'fill',
                    field: 'name',
                }, {
                    header: 'Forecasted',
                    type: 'text',
                    field: item => convertToCurrency(item.forecastedCost),
                    align: 'right'
                }, {
                    header: 'Actual',
                    type: 'text',
                    field: item => convertToCurrency(item.actualCost),
                    style: item => (item.actualCost > item.forecastedCost) ? `color: red;` : '',
                    align: 'right'
                }, {
                    header: '# of Staff',
                    type: 'text',
                    field: item => (item.resources) ? item.resources.length : item.numPeople,
                    align: 'center'
                }, {
                    header: 'Start Date',
                    type: 'text',
                    field: item => convertToDate(item.realStartDate),
                    align: 'center'
                }, {
                    header: 'End Date',
                    type: 'text',
                    field: item => convertToDate(item.realEndDate),
                    align: 'center'
                }
            ]
        }
    }
    customElements.define(PBProjectTable.is, PBProjectTable);
})();


