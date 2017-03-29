(function () {
    class PBProjectBudget extends Polymer.Element {

      static get is() { return 'pb-project-budget'; }

      static get properties() {
        return {
        }
      }

      constructor() {
        super();
      }
    }
    
    customElements.define(PBProjectBudget.is, PBProjectBudget);
})();