(function () {
    
    class PBProjectPhase extends Polymer.Element {
    
        static get is() { return 'pb-project-phase'; }

        static get properties() {
            return {
                phase: {
                    type: String,
                    value: ""
                },
                selectedPhase: {
                    type: String,
                    notify: true
                }
            }
        }

        constructor() {
            super();
            this.phaseList = [
                {
                    name: 'planning',
                    display: 'Planning'
                },
                {
                    name: 'seed1',
                    display: 'Seed 1'
                },
                {
                    name: 'seed2',
                    display: 'Seed 2'
                },
                {
                    name: 'seriesA',
                    display: 'Series A'
                },
                {
                    name: 'research',
                    display: 'Apl. Research'
                },
                {
                    name: 'accelerator',
                    display: 'Accel. East'
                }
            ]
        }

        computeClasses(name) { 
            let classList = "phase"; 
            if (name == this.phase) {
                console.log(name);
                return `${classList} selected`;
            }
            return classList;
        }

        handleOnClick(event) {            
            let previouslySelectedPhase = this.shadowRoot.querySelector('.phase.selected');
            let newSelectedPhase = event.currentTarget;
            let selectedPhaseName = event.target.getAttribute('data-phaseName');
            console.log(previouslySelectedPhase);
            previouslySelectedPhase.classList.remove("selected");
            newSelectedPhase.classList.add("selected");
            this.set('selectedPhase', selectedPhaseName);
        }

    }
    
    customElements.define(PBProjectPhase.is, PBProjectPhase);
})();
