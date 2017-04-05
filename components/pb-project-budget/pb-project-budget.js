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
        },

      }
    }

    constructor() {
      super();
    }

    connectedCallback() {
      super.connectedCallback();
      Polymer.RenderStatus.beforeNextRender(this, function () {
        let input = this.shadowRoot.getElementById('budget-input');
        this.setupCostInputListeners(input);

      });
    }

    displayCost(cost) {
      /*let commaStr =*/
      if(cost % 1 != 0){
        return cost.toLocaleString(undefined, { minimumFractionDigits: 2 });
      }else{
        return cost.toLocaleString();
      }
      //return `${commaStr}`;
    }

    checkIfShiftOrCtrl(e) {
      return e.shiftKey || e.metaKey || e.ctrlKey;
    }

    checkIfArrowKey(e) {
      return e.which >= 37 && e.which <= 40;
    }

    checkIfBackspace(e) {
      return e.which === 8;
    }

    checkIfNumeric(e) {
      return e.which >= 48 && e.which <= 57;
    }

    checkIsDecimalPt(e) {
      return e.which === 190 && e.target.innerHTML.split('.').length === 1; //only 1 period allowed
    }

    checkIfValidInput(e) {
      return this.checkIfShiftOrCtrl(e) || this.checkIfArrowKey(e) || this.checkIfBackspace(e) || this.checkIfNumeric(e) || this.checkIsDecimalPt(e);
    }

    roundCost(val){
      return Number(Math.round(val+'e2')+'e-2'); 
    }

    setupCostInputListeners(input) {
      input.addEventListener('focus', (e) => {
        e.target.innerHTML = this.cost.toString();
      });

      input.addEventListener('keydown', (e) => {
        if (!this.checkIfValidInput(e)) {
          e.preventDefault();
          return false;
        }
      });

      input.addEventListener('keyup', (e) => {
        let value = e.target.innerHTML;
        //also if this goes over 9007199254740991 it's gonna start making 0s appear. I do not think we need to account for that much money.
        let newCost = this.roundCost(value);
        this.cost = (isNaN(newCost)) ? this.cost : newCost;

        this.dispatchEvent(new CustomEvent('PBCostChanged', { detail: { cost: this.cost } }));
        if (e.which === 13) input.blur();
      })

      input.addEventListener('blur', (e) => {
        e.target.innerHTML = this.displayCost(this.cost);
      });
    }
  }

  customElements.define(PBProjectBudget.is, PBProjectBudget);
})();