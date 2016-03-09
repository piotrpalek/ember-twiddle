import DS from 'ember-data';
import LocalStorageSerializer from 'ember-local-storage/serializers/serializer';

export default LocalStorageSerializer.extend({
  oldBelongTo(snapshot, json, relationship) {
    var attr = relationship.key;
    if (this.noSerializeOptionSpecified(attr)) {
      this._super(snapshot, json, relationship);
      return;
    }
    var includeIds = this.hasSerializeIdsOption(attr);
    var includeRecords = this.hasSerializeRecordsOption(attr);
    var embeddedSnapshot = snapshot.belongsTo(attr);
    var key;
    if (includeIds) {
      key = this.keyForRelationship(attr, relationship.kind, 'serialize');
      if (!embeddedSnapshot) {
        json[key] = null;
      } else {
        json[key] = embeddedSnapshot.id;

        if (relationship.options.polymorphic) {
          this.serializePolymorphicType(snapshot, json, relationship);
        }
      }
    } else if (includeRecords) {
      this._serializeEmbeddedBelongsTo(snapshot, json, relationship);
    }
  },

  serializeGist(snapshot, json, relationship) {
    json.relationships = json.relationships || {};
    json.relationships.gist = json.relationships.gist || {};
    json.relationships.gist.data = json.relationships.gist.data || {};
    const gistData = json.relationships.gist.data;

    gist.id  = gist.id || this.generateIdForRecord();
    delete json.gist;

    const gistRelationship = {
      id: gist.id,
      type: 'gist',
      attributes: gist
    };

    json.relationships.gists.data = gistRelationships;
  },

  serializeBelongsTo(snapshot, json, relationship) {
    const attr = relationship.key;
    json.relationships = json.relationships || {};

    if(attr !== 'gist') {
      this._super(...arguments);
      return;
    }

    const embeddedSnapshot = snapshot.belongsTo(attr);
    const serializedKey = this.keyForAttribute(attr);

    if (!embeddedSnapshot) {
      json.relationships[serializedKey] = null;
    } else {
      json.included = json.included || [];
      const record = embeddedSnapshot.record;
      const relationship = {
        id: record.get('id') || this.generateIdForRecord(),
        type: attr
      };
      const serializedData = embeddedSnapshot.record.serialize({ includeId: true });
      json.relationships[serializedKey] = relationship;

      json.included.push({
        id: relationship.id,
        type: relationship.type,
        attributes: serializedData
      });
    }
  },

  // serializeHasMany(snapshot, json, relationship) {
  //   this._super(...arguments);
  //   if(relationship.key === 'gists') {
  //     this.serializeGists(snapshot, json, relationship);
  //   }
  // },
  //
  generateIdForRecord() {
    return Math.random().toString(32).slice(2).substr(0, 8);
  },

  normalizeResponse(store, primaryModelClass, payload) {
    const normalizedHash = this._super(...arguments);

    // normalizedHash.included = normalizedHash.included || [];
    // const includedFromHash = hash.included;
    // normalizedHash.included.push(...includedFromHash);
    return normalizedHash;
  },

  _normalizeEmbeddedRelationship: function(store, relationshipMeta, relationshipHash) {
    let modelName = relationshipMeta.type;
    if (relationshipMeta.options.polymorphic) {
      modelName = relationshipHash.type;
    }
    let modelClass = store.modelFor(modelName);
    let serializer = store.serializerFor(modelName);

    return serializer.normalize(modelClass, relationshipHash, null);
  }
});
