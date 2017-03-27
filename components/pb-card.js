(function () {
    class PBCard extends Polymer.Element {

      static get is() { return 'pb-card'; }

      static get properties() {
        return {
          cost: {
              type: Number,
              notify: true
          },
          label: {
              type: String,
              notify: true
          }
        }
      }

      constructor() {
        super();
      }

      displayCost(cost) {
          let commaStr = cost.toLocaleString(undefined, { minimumFractionDigits: 0 });
          return `$${commaStr}`;
      }
    }
    
    customElements.define(PBCard.is, PBCard);
})();