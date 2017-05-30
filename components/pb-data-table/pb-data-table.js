
(function () {
    
    class PBDataTable extends Polymer.Element {

        static get is() { return 'pb-data-table'; }

        static get properties() {
            return {
                data: {
                    type: Array,
                    notify: true
                },
                fieldConfig:{
                    type: Object,
                    notify: true
                }
            }
        }

        constructor() {
            super();
            console.log(this.data);
        }

        getFieldItems(config, item){
            return (typeof config.field === 'function')?config.field(item):item[config.field];
        }

        applyStyle(config, item){
            return (typeof config.style === 'function')?config.style(item):(config.style || '');
        }

        isType(config, type){
            return config.type === type;
        }

        setColor(item, colorField){
            return `background-color: ${item[colorField]};`;
        }
        getImageSrc(item, imageField){
            return item[imageField];
        }

    }
    customElements.define(PBDataTable.is, PBDataTable);
})();


