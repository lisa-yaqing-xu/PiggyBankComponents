(function () {
    
    class PBProjectName extends Polymer.Element {
    
        static get is() { return 'pb-project-name'; }

        static get properties() {
            return {
                projectName: {
                    type: String,
                    value: "",
                    notify: true
                }
            }
        }

        constructor() {
            super();
        }
    }
    
    customElements.define(PBProjectName.is, PBProjectName);
})();
