(function () {
    'use strict';
    class PBComponentsDemo extends Polymer.Element {

        static get is() { return 'pb-components-demo'; }

        constructor() {
            super();
        }

        static get properties() {
            return {
                chartData: {
                    type: Array,
                    notify: true,
                    value: PBProjectWidgetTestDataFaker.fakeDataGenerator.generateStore(10)
                },
                projectData: {
                    type: Object,
                    notify: true,
                    value: PBProjectWidgetTestDataFaker.fakeDataGenerator.generateStore(1)[0]
                },
                monthTimestamp: {
                    type: Number,
                    notify: true,
                    value: 1458975342788
                },
                placeholderData: {
                    type: Object,
                    notify: true,
                    value: {}
                },
                tableData: {
                    type: Array,
                    notify: true,
                    value: PBProjectWidgetTestDataFaker.projectData
                },
                tableHeaders: {
                    type: Array,
                    notify: true,
                    value: ['Color', 'Project Name', 'Forecasted', 'Actual', '# of People', 'Start Date', 'End Date']
                },
                selectedDate: {
                    type: Object,
                    notify: true,
                    value: null
                },
                selectedPhase: {
                    type: String
                },
                selectedColor: {
                    type: String,
                    value: null,
                    notify: true
                }

            }
        }

        generateNewChartData() {
            this.chartData = PBProjectWidgetTestDataFaker.fakeDataGenerator.generateStore(10);
        }

        generatePlaceHolderData() {
            let newData = PBProjectWidgetTestDataFaker.fakeDataGenerator.generateStore(1)[0];
            this.set('placeholderData', {
                startDate: newData.projectedStartDate,
                endDate: newData.projectedEndDate,
            });
        }
        updateSelectedDate() {
            if (Math.random() > 0.1) {
                let year = Math.floor(Math.random() * 6) + 2012;
                let month = Math.floor(Math.random() * 12);
                let day = Math.floor(Math.random() * 28) + 1;
                this.selectedDate = new Date(year, month, day);
            }
            else this.selectedDate = null;

        }
        test() {
            return 'testing123'
        }
    }
    customElements.define(PBComponentsDemo.is, PBComponentsDemo);
})();