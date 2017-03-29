(function () {
    class PBProjectDetails extends Polymer.Element {

      static get is() { return 'pb-project-details'; }

      static get properties() {
        return {
          selectedPhase: {
              type: String
          },
        }
      }

      constructor() {
        super();
      }
      
    }
    
    customElements.define(PBProjectDetails.is, PBProjectDetails);
})();