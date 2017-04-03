(function () {
    console.log('colorpicker loaded');
    class PBColorPicker extends Polymer.Element {

        static get is() { return 'pb-color-picker'; }

        static get properties() {
            return {
                selectedColor: {
                    type: String,
                    notify: true,
                    value: null
                },
                colorOpts: {
                    type: Array,
                    value: function () {
                        return [
                            '#fa4659', '#cc3948', '#faac46',
                            '#ff7900', '#ffec1c', '#f0de1a',
                            '#3beb93', '#2eb872', '#b8e986',
                            '#8fb569', '#58fcd9', '#47c9ad',
                            '#6a7efc', '#5564c9', '#9013fe',
                            '#7e00ed', '#fa46ce', '#c738a5',
                            '#333333'
                        ]
                    }
                }
            }
        }

        constructor() {
            super();
        }
        connectedCallback(){
            super.connectedCallback();
            if(!this.selectedColor){
                this.set('selectedColor',this.colorOpts[0]);
                console.log(this.selectedColor);
            }
        }

        setBGColor(color) {
            return `background: ${color};`
        }

        selectColor(e) {
            let color = e.target.getAttribute('data-color');
            this.selectedColor = color;
        }

        getClass(color, selectedColor){
            return (color === selectedColor)?'pb-color-icon selected':'pb-color-icon';
        }

    }

    customElements.define(PBColorPicker.is, PBColorPicker);
})();