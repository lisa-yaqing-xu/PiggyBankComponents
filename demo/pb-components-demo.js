(function () {
    'use strict';
    class PBComponentsDemo extends Polymer.Element {

        static get is() { return 'pb-components-demo'; }


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
                selectedColor: {
                    type: String,
                    value: null,
                    notify: true
                },
                projectName: {
                    type: String,
                    value: null,
                    notify: true
                },
                addErrorMsg:{
                    type: String, 
                    value: null
                },
                showEditor:{
                    type: Boolean,
                    value: false
                }

            }
        }



        static get observers(){
            return [
                '_projectNameChanged(projectName)',
                '_selectedColorChanged(selectedColor)',
                '_selectedDateChanged(selectedDate)'
            ]
        }

        constructor() {
            super();
            this.selectedDate = {};
        }

        connectedCallback() {
            super.connectedCallback();
            Polymer.RenderStatus.beforeNextRender(this, function () {
               let datePicker = this.shadowRoot.getElementById('date-picker'); 
               datePicker.addEventListener('PBSelectedDateChanged',(event)=>{
                   //this is actually designed to be used with angular, so it's a little finagly here.
                   this.placeholderData = Object.assign({}, this.placeholderData);
               })
            });

        }
        generateNewChartData() {
            this.chartData = PBProjectWidgetTestDataFaker.fakeDataGenerator.generateStore(10);
        }

        enterAddMode(){
            this.showEditor = true;
            window.dispatchEvent(new Event('resize'));
        }
        exitAddMode(){
            this.placeholderData = {};
            this.showEditor = false;
            this.addErrorMsg = null;
            window.dispatchEvent(new Event('resize'));
        }
        mockCreateNewProject(){
            let isValid = this.validate();
            if (!isValid){
                this.set('addErrorMsg', 'Invalid Input');
                return;
            }
            let newData = this.placeholderData;
            let newChartItem = {
                projectedStartDate: newData.startDate.getTime(),
                projectedEndDate: newData.endDate.getTime(),
                realStartDate: newData.startDate.getTime(),
                realEndDate: newData.endDate.getTime(),
                id: newData.name,
                name: newData.name,
                fill: newData.color,
                numPeople: 0,
                forecastedCost: 0,
                actualCost: 0
            };
            this.chartData.push(newChartItem);
            this.chartData = Object.assign([],this.chartData);
            
            this.exitAddMode();
        }

        validate(){
            let newData = this.placeholderData;
            
            return !(!newData.startDate || !newData.endDate ||  (newData.startDate > newData.endDate) || !newData.color || !newData.name);
            
        }

        getEditorClasses(checker){
            return (checker)?'view show':'view';
        }

        getViewerClasses(checker){
            return (checker)?'view':'view show';
        }

        _projectNameChanged(projectName){
            //does not trigger update, we do not need this to trigger update in the charts
            this.placeholderData.name = projectName;  
            console.log(this.placeholderData); 
        }

        _selectedColorChanged(selectedColor){
            //same above
            this.placeholderData.color = selectedColor;
        }

        _selectedDateChanged(selectedDate){
            console.log(selectedDate);
        }


    }
    customElements.define(PBComponentsDemo.is, PBComponentsDemo);
})();