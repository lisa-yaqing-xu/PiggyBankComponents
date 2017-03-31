mkdir components/$1
touch components/$1/$1.html
touch components/$1/$1.js

echo "<link rel="import" href="../../bower_components/polymer/polymer-element.html">

<dom-module id=\"$1\">
    <template>
        <style>
            :host {
                display: block;
            }
        </style>
        <div>

        </div>
    </template>
    <script src=\"$1.js\"></script>
</dom-module>
" >> components/$1/$1.html

echo "(function () {
  'use strict';
  class PB extends Polymer.Element {

    static get is() { return '$1'; }

    static get properties() {
      return {

      }
    }

    static get observers() {
        return [

        ]
    }

    constructor() {
      super();
    }
  }
  customElements.define(PB.is, PB);
})();" >> components/$1/$1.js