
(function () {

    class PBResourceTable extends Polymer.Element {

        static get is() { return 'pb-resource-table'; }

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
        }


        getFieldConfig() {
            let toTag = this.toTag;
            return [
                {
                    header: 'Name',
                    type: 'text',
                    image: 'avatar',
                    field: 'name',
                }, {
                    header: 'Type',
                    type: 'text',
                    field: 'type',
                    align: 'center'
                }, {
                    header: 'Skills',
                    type: 'tags',
                    field: item => toTag(item.skills),
                    align: 'center'
                }, {
                    header: 'Allocation',
                    type: 'text',
                    field: item=>`${item.allocationPercent}%`,
                    align: 'center'
                }
            ]
        }

        

        toTag(tagSet){
            return tagSet.map((tag)=>{
                return tag.split(' ').map(word=>word.charAt(0)).join('');
            })
        }
        
    }
    customElements.define(PBResourceTable.is, PBResourceTable);
})();


