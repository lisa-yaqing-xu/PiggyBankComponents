(function () {
    class PBProjectBudget extends Polymer.Element {

      static get is() { return 'pb-project-budget'; }

      static get properties() {
        return {
          cost: {
              type: Number,
              notify: true,
              value: 0
          },
          label: {
              type: String,
              notify: true,
              value: "forecasted"
          }
        }
      }

      constructor() {
        super();
      }
    }
    
    customElements.define(PBProjectBudget.is, PBProjectBudget);
})();