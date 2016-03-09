import Ember from 'ember';

const { inject } = Ember;

export default Ember.Route.extend({
  notify: inject.service('notify'),
  demoApp: inject.service(),

  titleToken: Ember.computed.readOnly('controller.model.description'),

  beforeModel () {
    window.s = this.get('store');
    return this.session.fetch('github-oauth2').catch(function() {
      // Swallow error for now
    });
  },

  deactivate () {
    var gist = this.controller.get('model');
    if (gist.get('isNew')) {
      this.get('store').unloadRecord(gist);
    }
  },

  actions: {
    saveGist (gist) {
      var newGist = gist.get('isNew');
      if (!newGist && gist.get('ownerLogin') !== this.get('session.currentUser.login')) {
        this.send('fork', gist);
        return;
      }
      gist.save().then(() => {
        this.get('notify').info(`Saved to Gist ${gist.get('id')} on Github`);
        if(newGist) {
          this.transitionTo('gist.edit', gist).then(() => {
            this.send('setSaved');
          });
        } else {
          this.send('setSaved');
        }
      }).catch((this.catchSaveError.bind(this)));
    },

    setSaved () {
      this.get('controller').set('unsaved', false);
    },

    fork (gist) {
      gist.fork().then((response) => {
        this.get('store').find('gist', response.id).then((newGist) => {
          gist.get('files').toArray().forEach((file) => {
            file.set('gist', newGist);
          });
          return newGist.save().then(() => {
            this.transitionTo('gist.edit', newGist);
          });
        });
      }).catch(this.catchForkError.bind(this));
    },

    copy () {
      this.transitionTo('gist.new', {
        queryParams: {
          copyCurrentTwiddle: true
        }
      });
    },

    signInViaGithub () {
      this.session.open('github-oauth2').catch(function(error) {
        alert('Could not sign you in: ' + error.message);
        throw error;
      });
    },

    signOut () {
      this.session.close();
    },

    showTwiddles: function() {
      this.transitionTo('twiddles');
    },

    urlChanged: function(newUrl) {
      this.get('demoApp').postMessage({ newUrl });
    }
  },

  catchForkError(error) {
    if (error && error.errors) {
      let firstError = error.errors[0];
      if (firstError.code === "unprocessable" && firstError.field === "forks") {
        this.get('notify').error("You already own this gist.");
        return;
      }
    }
    this.get('notify').error("Something went wrong. The gist was not forked.");
    throw error;
  },

  catchSaveError(error) {
    if (error && error.errors) {
      let firstError = error.errors[0];
      if (firstError.code === "unprocessable") {
        this.get('notify').error("The gist is invalid, and could not be saved.");
        return;
      }
    }
    this.get('notify').error("Something went wrong. The gist was not saved.");
    throw error;
  }
});
