import Ember from 'ember';
import DS from 'ember-data';
const { hasMany, belongsTo } = DS;
const { computed: { alias } } = Ember;

export default DS.Model.extend({
  gist: belongsTo('gist', { async: true, dependent: 'destroy' })
});
