import Ember from 'ember';
import GistRoute from "ember-twiddle/routes/gist-base-route";

const { inject } = Ember;

export default GistRoute.extend({
  emberCli: inject.service('ember-cli'),

  model(params) {
    const model = this.get('store').createRecord(
      'gist',
      { description: 'New Twiddle' }
    );

    if (params.copyCurrentTwiddle) {
      this.get('store').peekAll('gistFile').setEach('gist', model);
    } else {
      const emberCli = this.get('emberCli');
      this.get('store').unloadAll('gistFile');
      model.get('files').pushObject(emberCli.generate('controllers/application'));
      model.get('files').pushObject(emberCli.generate('templates/application'));
      model.get('files').pushObject(emberCli.generate('twiddle.json'));
    }

    return model;
  },

  setupController(controller) {
    this._super(...arguments);

    // reset copyCurrentTwiddle, so it is not shown in the URL: this QP is only
    // needed when initializing the model for this route
    controller.set('copyCurrentTwiddle', false);

    this.controllerFor('gist').set('unsaved', true);
  }
});
