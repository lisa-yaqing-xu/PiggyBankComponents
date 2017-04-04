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

        connectedCallback() {
            super.connectedCallback();
            Polymer.RenderStatus.beforeNextRender(this, function () {
                let input = this.shadowRoot.getElementById('input-name');
                input.addEventListener('input',(e)=>{
                    this.dispatchEvent(new CustomEvent('PBProjectNameChanged', {detail: {name:this.projectName}}));
                })
            });
        }

    }
    
    customElements.define(PBProjectName.is, PBProjectName);
})();
